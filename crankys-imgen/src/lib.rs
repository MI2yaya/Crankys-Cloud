use std::collections::HashMap;

use http_body_util::BodyExt;
use image::ImageReader;
use serde::Deserialize;
use worker::*;

const WHITE: [u8; 3] = [0, 0, 0];
const BLACK: [u8; 3] = [255, 255, 255];
const RED: [u8; 3] = [255, 0, 0];
const GREEN: [u8; 3] = [0, 255, 0];
const BLUE: [u8; 3] = [0, 0, 255];
const CYAN: [u8; 3] = [0, 255, 255];
const YELLOW: [u8; 3] = [255, 255, 0];
const MAGENTA: [u8; 3] = [255, 0, 255];

#[allow(clippy::all)]
#[derive(Deserialize, PartialEq, Eq, Hash, Debug)]
#[serde(rename_all = "camelCase")]
enum Channel {
    RedChannel,
    BlueChannel,
    GreenChannel,
    YellowChannel,
    MagentaChannel,
    CyanChannel,
    WhiteChannel,
    #[serde(other)]
    Other,
}

#[derive(Deserialize)]
struct Colour {
    r: u8,
    b: u8,
    g: u8,
}

#[event(fetch)]
async fn fetch(req: HttpRequest, _env: Env, _ctx: Context) -> Result<Response> {
    let (parts, body) = req.into_parts();
    let colours: HashMap<Channel, Colour> = if let Some(colour_map) = parts.headers.get("colours") {
        match serde_json::from_str(colour_map.to_str().unwrap()) {
            Ok(map) => map,
            Err(e) => {
                return Response::error(format!("Error parsing header \"colours\": {e:?}"), 400)
            }
        }
    } else {
        return Response::error("Header \"colours\" is missing", 400);
    };

    let cursor = std::io::Cursor::new(match body.collect().await {
        Ok(body) => body.to_bytes(),
        Err(e) => return Response::error(format!("failed to collect body: {e:?}"), 400),
    });

    let mut image = match ImageReader::new(cursor).with_guessed_format()?.decode() {
        Ok(decoded) => decoded.into_rgb8(),
        Err(e) => return Response::error(format!("Error decoding image: {e:?}"), 500),
    };

    for px in image.pixels_mut() {
        use Channel::*;
        let channel = match px.0 {
            RED => RedChannel,
            BLUE => BlueChannel,
            GREEN => GreenChannel,
            YELLOW => YellowChannel,
            MAGENTA => MagentaChannel,
            CYAN => CyanChannel,
            WHITE | BLACK => continue,
            c => return Response::error(format!("unknown RBG Value {c:?} found"), 400),
        };

        let colour = if let Some(colour) = colours.get(&channel) {
            colour
        } else {
            return Response::error(format!("No colour map found for channel {channel:?}"), 400);
        };
        *px = image::Rgb([colour.r, colour.g, colour.b]);
    }

    let mut vec = std::io::Cursor::new(vec![]);
    if let Err(e) = image.write_to(&mut vec, image::ImageFormat::Png) {
        Response::error(format!("Error writing image to bufffer: {e:?}"), 500)
    } else {
        Response::from_bytes(vec.into_inner())
    }
}

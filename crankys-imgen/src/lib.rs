use std::collections::HashMap;

use http_body_util::BodyExt;
use image::{EncodableLayout, ImageReader};
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
    dbg!(&req);
    let (parts, body) = req.into_parts();
    let colours: HashMap<Channel, Colour> =
        serde_json::from_str(parts.headers.get("colours").unwrap().to_str().unwrap()).unwrap();

    let mut image = ImageReader::new(std::io::Cursor::new(
        body.collect().await.unwrap().to_bytes().as_bytes(),
    ))
    .with_guessed_format()?
    .decode()
    .unwrap()
    .into_rgb8();
    image.pixels_mut().for_each(|px| {
        use Channel::*;
        let get = match px.0 {
            RED => RedChannel,
            BLUE => BlueChannel,
            GREEN => GreenChannel,
            YELLOW => YellowChannel,
            MAGENTA => MagentaChannel,
            CYAN => CyanChannel,
            WHITE | BLACK => return,
            c => panic!("unknown RBG Value {c:?} found"),
        };

        let colour = colours
            .get(&get)
            .expect("No colour map found for channel {channel:?}");
        *px = image::Rgb([colour.r, colour.g, colour.b]);
    });

    let mut vec = std::io::Cursor::new(vec![]);
    image.write_to(&mut vec, image::ImageFormat::Png).unwrap();
    Response::from_bytes(vec.into_inner())
}

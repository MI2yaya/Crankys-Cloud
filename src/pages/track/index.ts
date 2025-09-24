class DeleteSection extends HTMLElement {
    constructor() {
        super();

        const button: HTMLElement = document.querySelector("[data-delete]")!;
        button.addEventListener("click", async () => {
            await fetch("/api/delete", {
                headers: {
                    trackID: this.dataset.id as string,
                },
                method: "DELETE",
            }).then(console.log);
        });
    }
}

customElements.define("delete-section", DeleteSection);

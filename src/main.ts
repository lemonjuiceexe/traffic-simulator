import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div>
        <h1>Vite + TypeScript</h1>
        <div class="card">
            <button id="counter" type="button">CLICKME</button>
        </div>
        <p class="read-the-docs">
            Click on the Vite and TypeScript logos to learn more
        </p>
        <p class="result">waiting for file...</p>
  </div>
`;

document.querySelector("p.read-the-docs")!.addEventListener("click", () => {
    window.open("https://vitejs.dev/guide/features.html", "_blank", "noopener");
});

console.log("AAAAAA");
fetch("/output.json")
    .then((res) => res.json())
    .then(
        (data) => (document.querySelector(".result")!.textContent = data["a"])
    );

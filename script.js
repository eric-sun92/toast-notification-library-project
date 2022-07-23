import Toast from "./Toast.js"


const button = document.querySelector("button");
button.addEventListener("click", () => {
    
    const toast = new Toast({
        position: "top-right",
        text: "Hello",
    })

});
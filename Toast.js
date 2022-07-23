const DEFAULT_OPTIONS = {
    autoClose: 5000,
    position: "top-right",
    onClose: () => {},
    canClose: true,
    showProgress: true,
    pauseOnHover: true,
    pauseOnLossFocus: true,
}

export default class Toast {
    #toastElem
    #autoCloseTimeout
    #removeBinded
    #autoClose
    #progressInterval
    #autoCloseInterval
    #timeVisible = 0;  
    #isPaused = false
    #unpause
    #pause
    #visibilityChange
    #shouldUnPause


    constructor(options){

        this.#toastElem = document.createElement("div");
        this.#toastElem.classList.add("toast");
        requestAnimationFrame(() => {
            this.#toastElem.classList.add("show");
        })
        this.#removeBinded = this.remove.bind(this);
        this.#unpause = () => { this.#isPaused = false};
        this.#pause = () => { this.#isPaused = true};
        this.#visibilityChange = () => { 
            this.#shouldUnPause = document.visibilityState === "visible"
        }
        this.update({ ...DEFAULT_OPTIONS, ...options});
    }

    set position (value){
        const currentContainer = this.#toastElem.parentElement;
        const selector = `.toast-container[data-position="${value}"]`;
        const container = document.querySelector(selector) ||
                        createContainer(value);
        
        container.append(this.#toastElem);
        if(currentContainer == null || currentContainer.hasChildren()) return 
        currentContainer.remove();
    }

    set text (value){
        this.#toastElem.textContent = value;
    }

    set autoClose(value){
        this.#autoClose = value;
        this.#timeVisible = 0;
        if(value === false) return


        let lastTime;
        const func = time => {

            if(this.#shouldUnPause){
                lastTime = null;
                this.#shouldUnPause = false;
            }

            if(lastTime == null){
                lastTime = time;
                this.#autoCloseInterval = requestAnimationFrame(func);
                return
            }
            if (!this.#isPaused){
                this.#timeVisible += time - lastTime;
                if(this.#timeVisible >= this.#autoClose) {
                    this.remove();
                    return
                }
            }
            lastTime = time;
            this.#autoCloseInterval = requestAnimationFrame(func);
    }
    this.#autoCloseInterval = requestAnimationFrame(func);
    }   

    set showProgress(value){
        this.#toastElem.classList.toggle("progress", value);
        this.#toastElem.style.setProperty("--progress", 1);

        if(value){
            let lastTimeCalled = new Date();
            this.#progressInterval = setInterval( () => {
                if(!this.#isPaused){
                    this.#timeVisible += new Date() - lastTimeCalled;
                    this.#toastElem.style.setProperty(
                        "--progress", 
                        1 - this.#timeVisible / this.#autoClose
                    )
                }

                lastTimeCalled = new Date();

            }, 10)
        }
    }

    set pauseOnHover(value){
        if(value){
            this.#toastElem.addEventListener("mouseover", this.#pause);
            this.#toastElem.addEventListener("mouseleave", this.#unpause);
        }
        else{
            this.#toastElem.removeEventListener("mouseover", this.#pause);
            this.#toastElem.removeEventListener("mouseleave", this.#unpause);

        }
    }
    set pauseOnLossFocus(value){
        if(value){
            document.addEventListener("visibilitychange", this.#visibilityChange)
        }
        else{
            document.removeEventListener("visibilitychange", this.#visibilityChange)

        }
    }

    set canClose(value){
        this.#toastElem.classList.toggle("can-close", value);
        if(value){
            this.#toastElem.addEventListener("click", this.#removeBinded);
        }
        else{
            this.#toastElem.removeEventListener("click", this.#removeBinded);
        }
    }

    update(options){
        Object.entries(options).forEach(
            ([key, value]) => {
            this[key] = value;
            }
        )
    }

    remove(){
        cancelAnimationFrame(this.#autoCloseInterval);
        clearInterval(this.#progressInterval);

        const container = this.#toastElem.parentElement;
        this.#toastElem.classList.remove("show");
        this.#toastElem.addEventListener("transitionend", () => {

            this.#toastElem.remove();
            if(container.hasChildNodes()) return
            container.remove();

        })
        this.onClose();
     
    }
}

function createContainer(position){
        const container = document.createElement("div");
        container.dataset.position = position;
        container.classList.add("toast-container")
        document.body.append(container);
        return container;
    }



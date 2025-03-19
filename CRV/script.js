     function addRow() {
            const container = document.getElementById("editorContainer");
            const row = document.createElement("div");
            row.classList.add("row-container");
            row.innerHTML = `<button class='delete-btn' onclick='this.parentElement.remove()'>x</button>`;
            container.appendChild(row);
			addColumn();
        }

        function addColumn() {
            const rows = document.querySelectorAll(".row-container");
            if (rows.length === 0) {
                alert("Crie uma linha antes de adicionar uma coluna.");
                return;
            }
            const lastRow = rows[rows.length - 1];

            const column = document.createElement("div");
            column.classList.add("column-container");
            column.innerHTML = `<button class='delete-btn' onclick='this.parentElement.remove()'>x</button>`;
            lastRow.appendChild(column);
        }

        function addBlock(type) {
            const rows = document.querySelectorAll(".row-container");
            if (rows.length === 0) {
                alert("Crie uma linha antes de adicionar um bloco!");
                return;
            }
            const lastRow = rows[rows.length - 1];
            const columns = lastRow.querySelectorAll(".column-container");

            let targetContainer;
            if (columns.length > 0) {
                targetContainer = columns[columns.length - 1];
            } else {
                targetContainer = lastRow;
            }

            const block = document.createElement("div");
            block.classList.add("block", `block-${type}`);
            block.style.padding = "10px";
            block.style.textAlign = "center";
            block.style.position = "relative";
            block.style.minHeight = "50px";
            block.onclick = () => selectedBlock = block;

            if (type === 'quote') {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.style.display = "none";

                const uploadBtn = document.createElement("button");
                uploadBtn.textContent = "Escolher Imagem";
                uploadBtn.classList.add("btn", "btn-primary");
                uploadBtn.style.display = "block";
                uploadBtn.style.margin = "5px auto";
                uploadBtn.onclick = () => input.click();

                input.addEventListener("change", function (event) {
                    const file = event.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            // Criar imagem carregada
                            const img = document.createElement("img");
							img.src = e.target.result;
							img.style.width = "100%";
							img.style.height = "auto";
							img.style.borderRadius = "5px";
							img.style.display = "block";

							block.innerHTML = "";
							block.style.height = "auto";
							block.appendChild(img);

                            const deleteBtn = document.createElement("span");
                            deleteBtn.classList.add("delete-btn");
                            deleteBtn.textContent = "x";
                            deleteBtn.style.position = "absolute";
                            deleteBtn.style.top = "5px";
                            deleteBtn.style.right = "5px";
                            deleteBtn.style.background = "red";
                            deleteBtn.style.color = "white";
                            deleteBtn.style.padding = "3px 6px";
                            deleteBtn.style.cursor = "pointer";
                            deleteBtn.onclick = () => block.remove();
                            block.appendChild(deleteBtn);
                        };
                        reader.readAsDataURL(file);
                    }
                });

                block.appendChild(uploadBtn);
                block.appendChild(input);
            } else {
                block.innerHTML = {
                    'title': "<p class='titulo' contenteditable='true'></p>",
                    'text': "<p class='texto' contenteditable='true'></p>",
                    'list': "<ul class='lista' contenteditable='true'><li></li></ul>"
                }[type];
            }

            const deleteBtn = document.createElement("span");
            deleteBtn.classList.add("delete-btn");
            deleteBtn.textContent = "x";
            deleteBtn.onclick = () => block.remove();
            block.appendChild(deleteBtn);

            targetContainer.appendChild(block);
        }

        async function downloadImage() {
            await ensureImagesAreLoaded();

            const container = document.getElementById("editorContainer");

            html2canvas(container, {
                backgroundColor: null,
                scale: 2,
                useCORS: true
            }).then(canvas => {
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "resumo.png";
                link.click();
            }).catch(error => {
                console.error("Erro ao gerar a imagem:", error);
            });
        }

        async function ensureImagesAreLoaded() {
            const images = document.querySelectorAll("#editorContainer img");

            const promises = Array.from(images).map(async (img) => {
                if (!img.src.startsWith("data")) {
                    try {
                        const base64 = await convertImageToBase64(img.src);
                        img.setAttribute("src", base64);
                    } catch (error) {
                        console.error("Erro ao carregar imagem:", error);
                    }
                }
            });

            await Promise.all(promises);
        }

        async function convertImageToBase64(url) {
            return new Promise((resolve, reject) => {
                let img = new Image();
                img.crossOrigin = "Anonymous";
                img.onload = function () {
                    let canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    let ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL("image/png"));
                };
                img.onerror = () => reject("Falha ao carregar imagem externa.");
                img.src = url + "?not-from-cache-please";
            });
        }

        function downloadImage() {
            const container = document.getElementById("editorContainer");

            html2canvas(container, {
                backgroundColor: null,
                scale: 2,
                useCORS: true,
                logging: true,
                allowTaint: false,
                imageTimeout: 0
            }).then(canvas => {
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "resumo.png";
                link.click();
            }).catch(error => {
                console.error("Erro ao gerar a imagem:", error);
            });
        }

        document.addEventListener("click", function (event) {
            if (event.target.classList.contains("block")) {
                selectedBlock = event.target;
            }
        });
		
		function dragStart(event) {
            event.target.classList.add("dragging");
        }

        function dragEnd(event) {
            event.target.classList.remove("dragging");
        }

        function changeBlockColor(color) {
            if (selectedBlock) {
                selectedBlock.style.backgroundColor = color;
                selectedBlock.style.color = "white";
            }
        }

        function changeFontSize(delta) {
            if (selectedBlock) {
                let currentSize = window.getComputedStyle(selectedBlock, null).getPropertyValue('font-size');
                let newSize = parseInt(currentSize) + delta;
                selectedBlock.style.fontSize = newSize + 'px';
            }
        }
		
		function openTutorial() {
			document.getElementById("tutorialModal").style.display = "flex";
		}

		function closeTutorial() {
			document.getElementById("tutorialModal").style.display = "none";
		}
		
		let selectedBlock = null;

		document.addEventListener("click", function (event) {
			let block = event.target.closest(".block");
			if (block) {
				selectedBlock = block;
			}
		});
		
			function alignText(alignment) {
			if (selectedBlock) {
				// Remove alinhamento anterior
				selectedBlock.style.removeProperty("justify-content");
				selectedBlock.style.removeProperty("text-align");

				// Aplica o novo alinhamento forçando "!important"
				selectedBlock.style.setProperty("justify-content", alignment, "important");
				selectedBlock.style.setProperty("text-align", alignment, "important");
			}
		}

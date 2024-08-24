interface Hint extends HTMLElement {
  targetElement: HTMLElement;
}

const KeyboardHintsSystem = (() => {
  let characters: string = "asdfgqwertzxcvb";
  let hintsContainer: HTMLElement | null = null;
  let hints: Hint[] = [];
  let prefix: string = "";
  let isActive: boolean = false;
  let selectionTimer: number | null = null;

  function createStyle(): void {
    const style = document.createElement("style");
    style.textContent = `
            #vscode-easy-hints-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 999999;
            }
            .vscode-easy-hint {
                position: absolute;
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 3px;
                font-family: Arial, sans-serif;
                font-weight: bold;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                z-index: 1000000;
                transition: all 0.1s ease-in-out;
                padding: 2px;
                box-sizing: border-box;
            }
            .vscode-easy-hint:hover {
                transform: scale(1.05);
                box-shadow: 0 3px 6px rgba(0, 0, 0, 0.6);
            }
            .vscode-easy-hint span {
                transition: opacity 0.1s ease-in-out;
            }
    `;
    document.head.appendChild(style);
  }

  function createHintElement(label: string, target: HTMLElement): Hint {
    const hint = document.createElement("div") as any as Hint;
    hint.className = "vscode-easy-hint";

    const rect = target.getBoundingClientRect();
    hint.style.position = "absolute";
    hint.style.width = `${rect.width}px`;
    hint.style.height = `${rect.height}px`;
    hint.style.display = "flex";
    hint.style.alignItems = "center";
    hint.style.justifyContent = "center";
    hint.dataset.target = label;
    hint.targetElement = target;

    label.split("").forEach((char) => {
      const span = document.createElement("span");
      span.textContent = char;
      hint.appendChild(span);
    });

    return hint;
  }

  function positionHints(): void {
    hints.forEach((hint) => {
      const rect = hint.targetElement.getBoundingClientRect();
      hint.style.top = `${rect.top}px`;
      hint.style.left = `${rect.left}px`;
      adjustFontSize(hint);
    });
  }

  function adjustFontSize(hint: Hint): void {
    const maxWidth = hint.offsetWidth - 1;
    const maxHeight = hint.offsetHeight - 1;
    let fontSize = 14;

    hint.style.fontSize = `${fontSize}px`;

    while (
      (hint.scrollWidth > maxWidth || hint.scrollHeight > maxHeight) &&
      fontSize > 10
    ) {
      fontSize--;
      hint.style.fontSize = `${fontSize}px`;
    }
  }

  function createHints(): void {
    createStyle();

    hintsContainer = document.createElement("div");
    hintsContainer.id = "vscode-easy-hints-container";
    document.body.appendChild(hintsContainer);

    const elements = getClickableElements();
    const hintLabels = generateHintLabels(elements.length);

    elements.forEach((element, index) => {
      const hint = createHintElement(hintLabels[index], element);
      hintsContainer?.appendChild(hint);
      hints.push(hint);
    });

    positionHints();
  }

  function getClickableElements(): HTMLElement[] {
    const selector = `
             button, select, input, .clickable, .monaco-dropdown,
			[role="button"], [role="checkbox"], [role="radio"],
            [role="tab"], [role="menuitem"], [role="option"],
            [role="switch"], [contenteditable="true"],
            [role="textbox"],
            [role="combobox"],
            [role="gridcell"]
        `;
    // Not working:
    // `.detected-link`
    return Array.from(document.querySelectorAll(selector)).filter(
      (element): element is HTMLElement =>
        isElementClickable(element) && isElementVisible(element)
    );
  }

  function isElementClickable(element: Element): boolean {
    if (element.getAttribute("aria-disabled") === "true") {
      return false;
    }

    const style = getComputedStyle(element);
    if (
      style.pointerEvents === "none" ||
      style.display === "none" ||
      style.visibility === "hidden"
    ) {
      return false;
    }

    if (element.tagName.toLowerCase() === "input") {
      const type = (element as HTMLInputElement).type.toLowerCase();
      return [
        "submit",
        "button",
        "checkbox",
        "radio",
        "reset",
        "text",
        "number",
        "email",
        "password",
        "search",
        "file",
      ].includes(type);
    }

    return true;
  }

  function isElementVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function generateHintLabels(count: number): string[] {
    const labels: string[] = [];
    const base = characters.length;

    for (let i = 0; i < count; i++) {
      let num = i;
      let label = "";
      do {
        label = characters[num % base] + label;
        num = Math.floor(num / base);
      } while (num > 0);
      labels.push(label.toUpperCase());
    }

    return labels;
  }

  function handleHintInput(key: string): void {
    if (selectionTimer !== null) {
      clearTimeout(selectionTimer);
    }
    prefix += key.toLowerCase();

    const matchedHints = hints.filter((hint) =>
      hint.dataset.target!.toLowerCase().startsWith(prefix)
    );

    if (matchedHints.length === 0) {
      removeHints();
    } else if (
      matchedHints.length === 1 &&
      matchedHints[0].dataset.target!.toLowerCase() === prefix
    ) {
      activateElement(matchedHints[0].targetElement);
      removeHints();
    } else {
      updateHints(matchedHints);
      selectionTimer = window.setTimeout(() => {
        if (matchedHints.length > 0) {
          activateElement(matchedHints[0].targetElement);
          removeHints();
        }
      }, 500);
    }
  }

  function activateElement(element: HTMLElement): void {
    removeHints();
    setTimeout(() => {
      if (element.tagName.toLowerCase() === "input") {
        const inputElement = element as HTMLInputElement;
        const type = inputElement.type.toLowerCase();
        if (type === "checkbox" || type === "radio") {
          inputElement.checked = !inputElement.checked;
          inputElement.dispatchEvent(new Event("change", { bubbles: true }));
        } else {
          inputElement.focus();
        }
      } else if (element.tagName.toLowerCase() === "select") {
        (element as HTMLSelectElement).focus();
      } else {
        // Focus the element
        element.focus();

        // Simulate mousedown and click events
        const mousedownEvent = new MouseEvent("mousedown", {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        element.dispatchEvent(mousedownEvent);

        const clickEvent = new MouseEvent("click", {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        element.dispatchEvent(clickEvent);

        // Handle links
        if (
          element.tagName.toLowerCase() === "a" &&
          (element as HTMLAnchorElement).href
        ) {
          window.location.href = (element as HTMLAnchorElement).href;
        }
      }

      if (
        element.tagName.toLowerCase() === "a" &&
        (element as HTMLAnchorElement).href
      ) {
        window.location.href = (element as HTMLAnchorElement).href;
      }
    }, 0);
  }

  function updateHints(visibleHints: Hint[]): void {
    hints.forEach((hint) => {
      if (visibleHints.includes(hint)) {
        hint.style.display = "flex";
        updateHintText(hint);
      } else {
        hint.style.display = "none";
      }
    });
  }

  function updateHintText(hint: Hint): void {
    const spans = hint.querySelectorAll("span");

    spans.forEach((span, index) => {
      span.style.opacity = index < prefix.length ? "0.5" : "1";
    });

    adjustFontSize(hint);
  }

  function removeHints(): void {
    if (selectionTimer !== null) {
      clearTimeout(selectionTimer);
    }
    if (hintsContainer) {
      hintsContainer.remove();
      hintsContainer = null;
    }
    hints = [];
    prefix = "";
    isActive = false;
    document.removeEventListener("keydown", handleKeydown, true);
  }

  function setCharacters(chars: string): void {
    characters = chars;
  }

  function toggleHints(): void {
    if (isActive) {
      removeHints();
    } else {
      createHints();
      isActive = true;
      document.addEventListener("keydown", handleKeydown, true);
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.code === "Space") {
      event.preventDefault();
      event.stopPropagation();
      toggleHints();
    } else if (isActive) {
      event.preventDefault();
      event.stopPropagation();
      handleHintInput(event.key);
    }
  }

  function captureEvents(event: Event): void {
    if (isActive && event.type !== "keydown") {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  const eventTypes = [
    "click",
    "mousedown",
    "mouseup",
    "mousemove",
    "keyup",
    "keypress",
    "focus",
    "blur",
    "input",
    "change",
    "contextmenu",
  ];
  eventTypes.forEach((eventType) => {
    document.addEventListener(eventType, captureEvents, true);
  });

  return {
    toggleHints,
    setCharacters,
    isActive: () => isActive,
  };
})();

// Initial setup
document.addEventListener("keydown", (event: KeyboardEvent) => {
  // is in vim insert mode
  const statusBarItem = document.querySelector("#vscodevim\\.vim\\.primary");
  const isInsertMode =
    statusBarItem &&
    statusBarItem.textContent?.includes("INSERT") &&
    // Insert can be visible, but the active element is outside of the editor
    document.activeElement?.parentElement?.parentElement?.classList.contains(
      "monaco-editor"
    );

  // There is a line cursor in the active editor and its visible
  const cursorLineStyle =
    (
      document
        .querySelector(".active .cursor-line-style")
        ?.querySelector(".cursor") as HTMLElement
    )?.style.visibility !== "hidden";
  // There is a visible block cursor
  const cursorBlockStyle = document.querySelector(
    ".active .cursor-block-style"
  );

  if (isInsertMode) {
    return;
  }

  if (event.ctrlKey && event.code === "Space") {
    event.preventDefault();
    KeyboardHintsSystem.toggleHints();
  }
});

// Optionally, set custom characters
// KeyboardHintsSystem.setCharacters("asdfjklqwertyuiop");

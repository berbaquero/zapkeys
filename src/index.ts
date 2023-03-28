type AssignedShortcuts = Map<string, HTMLElement>;

type NodeCoordinates = {
  top: number;
  left: number;
};

export interface ZapKeysOptions {
  startKey?: string;
  onActive?: () => void;
  onInactive?: () => void;
}

const clickableElements = ['A', 'BUTTON'];
const mixedElements = ['INPUT'];
const focusableElements = ['TEXTAREA'];
const togglableElements = ['DETAILS'];
const clickableInputs = ['submit', 'button'];
const whitelist = [
  ...clickableElements,
  ...mixedElements,
  ...focusableElements,
  ...togglableElements,
];
const shortcutLetters = 'asdfghjklcpwem';

export class ZapKeys {
  private selector: string;
  private startKey: string;
  private shortcuts: AssignedShortcuts;
  private sequenceMode: boolean;
  private singleLetters: string;
  private sequenceLetters: string;
  private firstSequenceLetter: string;
  private onActive?: () => void;
  private onInactive?: () => void;

  constructor({ startKey = 'f', onActive, onInactive }: ZapKeysOptions = {}) {
    this.selector = whitelist.join(',');
    this.startKey = startKey;
    this.shortcuts = new Map<string, HTMLElement>();
    this.onActive = onActive;
    this.onInactive = onInactive;
    this.listenForShortcuts = this.listenForShortcuts.bind(this);
    this.handleStartKey = this.handleStartKey.bind(this);
    this.handleShortcuts = this.handleShortcuts.bind(this);
    this.restart = this.restart.bind(this);
    this.handleEsc = this.handleEsc.bind(this);
    this.assignLettersToElements = this.assignLettersToElements.bind(this);
    this.triggerShortcut = this.triggerShortcut.bind(this);
    this.sequenceMode = false;
    this.singleLetters = '';
    this.sequenceLetters = '';
    this.firstSequenceLetter = '';
  }

  init({ active = false } = {}): void {
    window.addEventListener('keypress', this.handleStartKey);
    if (active) this.activate();
  }

  terminate(): void {
    this.restart();
    window.removeEventListener('keypress', this.handleStartKey);
  }

  private assignLettersToElements(
    letters: string,
    elements: HTMLElement[],
    groups: number
  ): void {
    const groupLetters = letters.substring(0, groups);
    const singleLetters = letters.substring(groups);
    this.singleLetters = singleLetters;
    this.sequenceLetters = groupLetters;
    const shortcutLetters = generateShortcutLetters(
      singleLetters,
      groupLetters
    );
    elements.forEach((element, index) => {
      this.shortcuts.set(shortcutLetters[index], element);
    });
  }

  private handleShortcuts(ev: KeyboardEvent): void {
    const pressedKey = ev.key;
    const singleKeyPressed = this.singleLetters.indexOf(pressedKey) >= 0;
    const sequenceKeyPressed = this.sequenceLetters.indexOf(pressedKey) >= 0;

    if (
      (!singleKeyPressed && !sequenceKeyPressed) ||
      (singleKeyPressed && !this.shortcuts.has(pressedKey)) ||
      (this.sequenceMode &&
        !this.shortcuts.has(this.firstSequenceLetter + pressedKey))
    ) {
      // Key/sequence pressed is not a shortcut
      document.getElementById('sk-overlay')!.click(); // Trigger click, ergo restart
      return;
    }

    if (this.sequenceMode) {
      const sequenceShortcut = this.firstSequenceLetter + pressedKey;
      this.triggerShortcut(sequenceShortcut);
    } else {
      if (sequenceKeyPressed) {
        this.firstSequenceLetter = pressedKey;
        this.sequenceMode = true;
        // hide other letters
        document.getElementById('sk-overlay')!.classList.add('sequence');
        hideShortcut(pressedKey);
      } else {
        // trigger single key shortcut
        this.triggerShortcut(pressedKey);
      }
    }
  }

  private triggerShortcut(shortcut: string): void {
    const foundElement = this.shortcuts.get(shortcut)!;
    if (clickableElements.includes(foundElement.tagName))
      triggerClickableElement(foundElement);

    if (
      mixedElements.includes(foundElement.tagName) &&
      foundElement instanceof HTMLInputElement
    )
      triggerMixedElement(foundElement);

    if (focusableElements.includes(foundElement.tagName))
      triggerFocusableElement(foundElement);

    if (togglableElements.includes(foundElement.tagName)) {
      triggerToggableElement(foundElement);
    }
  }

  private listenForShortcuts(): void {
    window.addEventListener('keypress', this.handleShortcuts);
  }

  private handleStartKey(ev: KeyboardEvent): void {
    const { activeElement } = document;

    if (
      activeElement &&
      (activeElement.tagName === 'TEXTAREA' ||
        (activeElement instanceof HTMLInputElement &&
          ['text'].includes(activeElement.type)))
    ) {
      ev.stopPropagation();
      return;
    }
    if (ev.key !== this.startKey) return;
    this.activate();
  }

  private activate() {
    const elements = getElements(this.selector);
    const groups = getNumberOfGroups(elements.length, shortcutLetters.length);
    this.assignLettersToElements(shortcutLetters, elements, groups);
    showLetterIndicators(this.shortcuts);
    this.listenForShortcuts();
    this.listenForExit();
    window.removeEventListener('keypress', this.handleStartKey);
    if (this.onActive) this.onActive();
  }

  private restart(): void {
    hideLetterIndicators();
    this.stopListeningForExit();
    this.stopListeningForShortcuts();
    this.shortcuts.clear();
    this.sequenceMode = false;
    this.firstSequenceLetter = '';
    if (this.onInactive) this.onInactive();
    this.init();
  }

  private handleEsc(ev: KeyboardEvent) {
    if (ev.keyCode !== 27) {
      // Not Esc key
      return;
    }
    this.restart();
  }

  private listenForExit(): void {
    window.addEventListener('keydown', this.handleEsc);
    document.body.addEventListener('click', this.restart);
  }

  private stopListeningForShortcuts(): void {
    window.removeEventListener('keypress', this.handleShortcuts);
  }

  private stopListeningForExit(): void {
    document.body.removeEventListener('click', this.restart);
    window.removeEventListener('keydown', this.handleEsc);
  }
}

function hideLetterIndicators(): void {
  // Hide overlay
  const overlayDiv = document.getElementById('sk-overlay')!;
  overlayDiv.parentNode!.removeChild(overlayDiv);
}

function createLetterIndicator(
  element: HTMLElement,
  letter: string
): HTMLDivElement {
  const letterSquare = document.createElement('div');
  const coordinates = getNodeCoordinates(element);
  letterSquare.className = '__zk-letter';
  letterSquare.textContent = letter;
  letterSquare.style.top = `${coordinates.top}px`;
  letterSquare.style.left = `${coordinates.left}px`;
  letterSquare.dataset.sk = letter.length === 1 ? 'hide' : 'show';
  letterSquare.dataset.skSeq = letter[0];
  return letterSquare;
}

function getNodeCoordinates(elem: HTMLElement): NodeCoordinates {
  const box = elem.getClientRects()[0];

  return {
    top: box.top + window.pageYOffset,
    left: box.left + window.pageXOffset,
  };
}

function showLetterIndicators(assignedShortcuts: AssignedShortcuts): void {
  // Add overlay div "canvas"
  const overlayDiv = document.createElement('div');
  overlayDiv.id = 'sk-overlay';
  overlayDiv.className = '__zk-overlay';
  document.body.appendChild(overlayDiv);

  assignedShortcuts.forEach((element, letter) => {
    const letterIndicator = createLetterIndicator(element, letter);
    overlayDiv.appendChild(letterIndicator);
  });
}

function getElements(selector: string): HTMLElement[] {
  const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
  return elements
    .filter(element => whitelist.indexOf(element.tagName) >= 0)
    .filter(isVisible)
    .filter(isInViewport);
}

function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function isNewWindowLink(element: HTMLElement): boolean {
  return element instanceof HTMLAnchorElement && element.target === '_blank';
}

function isVisible(element: HTMLElement): boolean {
  return element.offsetWidth > 0 || element.offsetHeight > 0;
}

function getNumberOfGroups(elements: number, letters: number): number {
  if (elements <= letters) {
    return 0;
  }
  return Math.round(elements / letters);
}

function generateShortcutLetters(
  singleLetters: string,
  groupLetters: string
): string[] {
  const splittedSingleLetters = singleLetters.split('');
  const splittedGroupLetters = groupLetters.split('');
  const secondaryLetters = [...splittedGroupLetters, ...splittedSingleLetters];
  const groupLetterShortcuts = splittedGroupLetters.reduce((result, letter) => {
    secondaryLetters.forEach(secondaryLetter => {
      // @ts-ignore
      result.push(letter + secondaryLetter);
    });
    return result;
  }, []);
  return [...splittedSingleLetters, ...groupLetterShortcuts];
}

function hideShortcut(sequenceLetter: string): void {
  const elementsToHide = Array.from(
    document.querySelectorAll<HTMLElement>(
      `#sk-overlay > :not([data-sk-seq=${sequenceLetter}])`
    )
  );
  elementsToHide.forEach(element => (element.style.display = 'none'));
}

// Element triggers
function triggerClickableElement(element: HTMLElement): void {
  if (isNewWindowLink(element)) {
    element.focus();
    document.getElementById('sk-overlay')!.click(); // Trigger click, ergo restart
  } else {
    element.focus();
    element.click(); // Programmatic click will trigger click listener, ergo restart
  }
}

function triggerMixedElement(element: HTMLInputElement): void {
  if (clickableInputs.includes(element.type)) triggerClickableElement(element);
  else triggerFocusableElement(element);
}

function triggerFocusableElement(element: HTMLElement): void {
  element.focus();
  document.getElementById('sk-overlay')!.click(); // Trigger click, ergo restart
}

function triggerToggableElement(element: HTMLElement): void {
  element.querySelector<HTMLElement>('summary')!.click(); // Programmatic click will trigger click listener, ergo restart
}

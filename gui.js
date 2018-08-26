class Button extends Rectangle {
	constructor(x, y, w, h, bgcolor, func, text = '', textColor = 'black', textFont = 'Helvetica', textSize = 10) {
		super(x, y, w, h, bgcolor);
		this.func = func;
		this.text = text;
		this.textColor = textColor;
		this.textFont = textFont;
		this.textSize = this.h * 2/5;
		this.textAlign = CENTER;
	}

	textAlignLeft() {
		this.textAlign = LEFT;
	}

	textAlignCenter() {
		this.textAlign = CENTER;
	}

	textAlignRight() {
		this.textAlign = RIGHT;
	}

	draw() {
		super.draw();

		textAlign(this.textAlign, CENTER);
		fill(this.textColor);
		textSize(this.textSize);
		textFont(this.textFont);
		text(this.text, this.x, this.y, this.w, this.h)
	}
}

function displayPauseMenu() {
	for(let pauseButton of pauseButtons) {
		pauseButton.draw();
	}
}
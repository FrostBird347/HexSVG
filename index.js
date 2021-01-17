const fs = require("fs");
var InputText = process.argv[2];
try {
	if (!InputText.startsWith("E:") && !InputText.startsWith("D:")) {
		InvalidArgs();
	}
} catch {
	InvalidArgs();
}
Start();

/* --------------------------------------- */
/* Functions Below */

function InvalidArgs() {
	console.error("INVALID ARGS!");
	console.error("Correct format 'D:File to decode.', 'E:File to encode.'");
	process.exit(9);
}

function Start() {
	if (InputText.startsWith("E:")) {
		EncodeSVG(InputText.substr(2));
	} else {
		DecodeSVG(InputText.substr(2));
	}
}

//Encodes the SVG, I am planning on re-making this to save file size.
function EncodeSVG(InputFilePath) {
	try {
		var InputData = fs.readFileSync(InputFilePath);
	} catch {
		console.error("Failed to read file!");
		process.exit(1);
	}
	var HexString = InputData.toString('hex');
	var HexArray = new Array(Math.ceil(HexString.length / 8));
	for (var i = 0, charsLength = HexString.length; i < charsLength; i += 8) {
		HexArray[i/8] = HexString.substring(i, i + 8);
	}
	var OutSVG = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
	<svg height="258" width="` + (HexArray.length) + `" viewBox="258, ` + (HexArray.length) + `" xmlns="http://www.w3.org/2000/svg">
		<line x1="0" y1="257" x2="` + (HexArray.length) + `" y2="257" style="stroke:rgb(0,128,255); stroke-width:1">
		</line>`;
	HexArray.forEach(function(CurrentHexBlock, HexIndex) {
		var CurrentLinePos = (HexIndex);
		var FixedCurrentHexBlock = CurrentHexBlock;
		while (FixedCurrentHexBlock.length < 8) {
			FixedCurrentHexBlock += "0";
		}
		OutSVG += `
		<line x1="` + CurrentLinePos  + `" y1="257" x2="` + CurrentLinePos + `" y2="` + (257 - parseInt(Number("0x" + FixedCurrentHexBlock.substring(0, 2)), 10)) + `" style="stroke:#` + FixedCurrentHexBlock.substring(2) + `; stroke-width:1">
		</line>`;
	});
	OutSVG += `
	</svg>`
	fs.writeFileSync( 'out.svg', OutSVG );
}

function DecodeSVG(InputFilePath) {
	console.error("I have not made the decoder yet!");
	process.exit(1);
}

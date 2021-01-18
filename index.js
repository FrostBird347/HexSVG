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

function EncodeSVG(InputFilePath) {
	try {
		var InputData = fs.readFileSync(InputFilePath);
	} catch(err) {
		console.error("Failed to read file!");
		console.error(err);
		process.exit(1);
	}
	//Convert the file to a hex string and create the start of the SVG.
	var HexString = InputData.toString('hex');
	var OutSVG = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
	<svg height="2560" width="2560" viewBox="2560, 2560" xmlns="http://www.w3.org/2000/svg" style="background:{BGColour}">
	<polyline points="`;
	var BGColour = "#" + Math.floor(Math.random() * 16777215).toString(16).substr(4).repeat(4);
	var SizeCounter = 0;
	var CurrentHexBlock = ""
	var HexIndex = 0
	//Go through every 4 characters, convert them into a decimal number and add the points to a polyline.
	for (var i = 0, charsLength = HexString.length; i < charsLength; i += 4) {
		//I earlier split the string into a massive array and went through that.
		//This method saves a ton of memory.
		CurrentHexBlock = HexString.substring(i, i + 4);
		HexIndex = i / 4
		SizeCounter++;
		//Split the polyline every 1000 characters to reduce lag.
		if (SizeCounter % 250 == 0) {
			OutSVG += `" style="stroke:#` + Number(HexIndex * 16777215).toString(16).substr(0, 6) + `;fill:none;stroke-width:1" />
			<polyline points="`
			//If the new polyline colour matches the background, change the colour of the background.
			if (Number(HexIndex * 16777215).toString(16).substr(0, 6) == BGColour) {
				BGColour = "#" + Math.floor(Math.random() * 16777215).toString(16);
			}
		}
		var CurrentLinePos = (HexIndex);
		var FixedCurrentHexBlock = CurrentHexBlock;
		while (FixedCurrentHexBlock.length < 4) {
			FixedCurrentHexBlock += "0";
		}
		OutSVG += (parseInt(Number("0x" + FixedCurrentHexBlock.substring(0, 2)), 10) * 10) + "," + (parseInt(Number("0x" + FixedCurrentHexBlock.substring(2)), 10) * 10) + " ";
	}
	//End of the SVG file.
	OutSVG += `" style="stroke:#` + Number(HexString.length * 16777.215).toString(16).substr(0, 6) + `;fill:none;stroke-width:1" />
	</svg>`;
	fs.writeFileSync( 'out.svg', OutSVG.replace("{BGColour}", BGColour));
}

function DecodeSVG(InputFilePath) {
	console.error("I have not made the decoder yet!");
	process.exit(1);
}

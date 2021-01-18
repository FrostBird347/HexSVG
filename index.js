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
	//Convert the file to a hex string and create the start of the SVG
	var HexString = InputData.toString('hex');
	var FileNameRegex = /[^\.]+$/gi;
	var OutSVG = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg height="2560" width="2560" viewBox="2560, 2560" xmlns="http://www.w3.org/2000/svg" style="background:transparent">
	<!--` + FileNameRegex.exec(InputFilePath).toString() + `-->
	<polyline points="`;
	var SizeCounter = 0;
	var CurrentHexBlock = ""
	var HexIndex = 0
	//Go through every 4 characters, convert them into a decimal number and add the points to a polyline
	for (var i = 0, charsLength = HexString.length; i < charsLength; i += 4) {
		//I earlier split the string into a massive array and went through that
		//This method saves a ton of memory
		CurrentHexBlock = HexString.substring(i, i + 4);
		HexIndex = i / 4
		SizeCounter++;
		//Split the polyline every 1000 characters to reduce lag
		if (SizeCounter % 250 == 0) {
			OutSVG += `" style="stroke:#` + Number(HexIndex * 16777215).toString(16).substr(0, 6) + `;fill:none;stroke-width:1" />
	<polyline points="`
		}
		var CurrentLinePos = (HexIndex);
		var FixedCurrentHexBlock = CurrentHexBlock;
		while (FixedCurrentHexBlock.length < 4) {
			FixedCurrentHexBlock += "0";
		}
		OutSVG += (parseInt(Number("0x" + FixedCurrentHexBlock.substring(0, 2)), 10) * 10) + "," + (parseInt(Number("0x" + FixedCurrentHexBlock.substring(2)), 10) * 10) + " ";
	}
	//End of the SVG file
	OutSVG += `" style="stroke:#` + Number(HexString.length * 16777.215).toString(16).substr(0, 6) + `;fill:none;stroke-width:1" />
</svg>`;
	fs.writeFileSync( 'encoded.svg', OutSVG);
}

function DecodeSVG(InputFilePath) {
	try {
		var InputData = fs.readFileSync(InputFilePath);
	} catch(err) {
		console.error("Failed to read file!");
		console.error(err);
		process.exit(1);
	}
	var InputString = InputData.toString();
	//Check if SVG is the correct size and format
	if (!InputString.startsWith(`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg height="2560" width="2560" viewBox="2560, 2560" xmlns="http://www.w3.org/2000/svg"`)) {
		console.error("Invalid format!");
		process.exit(1);
	}
	//Regex to get points list
	var DataRegex = /(?<=<polyline points=")(.*?)(?= " style=")/gm;
	//Remove text between points for large files
	FixedInput = InputString.replace(/(" style="stroke:#?([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2});fill:none;stroke-width:1" \/>\s\s<polyline points=")/gm, '')
	//Create array of points
	var DataArray = DataRegex.exec(FixedInput).toString().replace(/ /g, ',').split(',');
	var DecodedFile = Array(DataArray.length);
	//Convert each point into valid hex
	DataArray.forEach((DecimalData, Index) => {
		DecodedFile[Index] = (parseInt(DecimalData) / 10).toString(16);
		while (DecodedFile[Index].length < 2) {
			DecodedFile[Index] = "0" + DecodedFile[Index]
		}
	});
	//Get the decoded file's extension
	var FileExtensionRegex = /(?<=	<!--)(.*?)(?=-->)/gm;
	var FileExtension = FileExtensionRegex.exec(InputString)[0];
	//Convert hex to a buffer and save
	fs.writeFileSync( 'decoded.' + FileExtension, Buffer.from(DecodedFile.toString().replace(/,/g, ''), "hex"));
}

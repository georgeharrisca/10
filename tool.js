// Attach event listener to the "Start Extraction" button once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
  const startButton = document.getElementById("startButton");

  // Ensure that the button is found
  if (startButton) {
    startButton.addEventListener("click", startExtraction);
  }
});

// Function to handle file input and read the file as text
document.getElementById("fileInput").addEventListener("change", function(e) {
  const file = e.target.files[0];
  
  if (!file) {
    alert("Please select a file.");
    return;
  }

  const reader = new FileReader();

  reader.onerror = function() {
    alert("Error reading the file.");
  };

  reader.onload = function(event) {
    const xmlText = event.target.result;

    // Log the file content for debugging purposes
    console.log("File content loaded:", xmlText);

    // Check if it's an XML file by verifying the first part of the content
    if (!xmlText.startsWith('<?xml')) {
      alert("Please upload a valid XML file.");
      return;
    }

    window.xmlText = xmlText;
  };

  reader.readAsText(file);
});

// The startExtraction function that runs all steps
function startExtraction() {
  console.log("Start Extraction button clicked!"); // Debugging log

  if (!window.xmlText) {
    alert("Please upload a valid XML file first.");
    return;
  }

  let partIndex = 1;  // Start with P1
  let partFound = true;  // Track whether a part is found

  while (partFound) {
    // Step 1: Extract everything from the beginning of the file up to and including <part-list>
    const partListIndex = window.xmlText.indexOf("<part-list>");
    if (partListIndex === -1) {
      alert("<part-list> tag not found in the XML file.");
      return;
    }

    const partListEndIndex = partListIndex + "<part-list>".length;
    let extractedContent = window.xmlText.slice(0, partListEndIndex);

    // Step 2: Dynamically find the <score-part id="PX"> and <part id="PX">
    const scorePartStartIndex = window.xmlText.indexOf(`<score-part id="P${partIndex}">`);
    if (scorePartStartIndex === -1) {
      // No more parts found, exit loop
      partFound = false;
      continue;
    }

    const scorePartEndIndex = window.xmlText.indexOf('</score-part>', scorePartStartIndex) + '</score-part>'.length;
    const scorePartContent = window.xmlText.slice(scorePartStartIndex, scorePartEndIndex);

    // Append the extracted score-part content and </part-list>
    extractedContent += "\n" + scorePartContent + "\n</part-list>";

    // Step 3: Extract the part content <part id="PX">
    const partStartIndex = window.xmlText.indexOf(`<part id="P${partIndex}">`, window.xmlText.indexOf("</part-list>"));
    if (partStartIndex === -1) {
      alert(`<part id="P${partIndex}"> tag not found in the XML file.`);
      return;
    }

    const partEndIndex = window.xmlText.indexOf('</part>', partStartIndex) + '</part>'.length;
    const partContent = window.xmlText.slice(partStartIndex, partEndIndex);

    // Append the extracted part content to the previously extracted content
    extractedContent += "\n" + partContent;

    // Step 4: Append </score-partwise> at the end to close the XML document for the current part
    const finalXmlString = extractedContent + "\n</score-partwise>";

    // Step 5: Automatically create the download link and trigger the download for this part
    const blob = new Blob([finalXmlString], { type: "application/xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `final_extracted_P${partIndex}.xml`;
    link.click();

    // Move to the next part (P1 -> P2 -> P3, etc.)
    partIndex++;
  }

  console.log("Extraction complete for all parts.");
}

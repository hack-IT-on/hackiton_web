import { jsPDF } from "jspdf";
import { readFile } from "fs/promises";
import path from "path";

export const generatePDF = async (
  templateUrl,
  userName,
  issueDate,
  eventName,
  certificate_id
) => {
  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Read the image file from the public directory
    const imagePath = path.join(process.cwd(), "public", templateUrl);
    const imageBuffer = await readFile(imagePath);

    // Convert buffer to base64
    const imageData = `data:image/jpeg;base64,${imageBuffer.toString(
      "base64"
    )}`;

    // Add template as background
    doc.addImage(imageData, "JPEG", 0, 0, 297, 210);

    // Configure text
    doc.setFont("helvetica");

    // Add event name
    doc.setFontSize(40);
    doc.setTextColor(0, 0, 0);
    doc.text(eventName, 297 / 2, 80, {
      align: "center",
      baseline: "middle",
    });

    // Add user name
    doc.setFontSize(30);
    doc.setTextColor(0, 0, 0);
    doc.text(userName, 297 / 2, 110, {
      align: "center",
      baseline: "middle",
    });

    // Add issue date
    doc.setFontSize(16);
    doc.text(
      `Issued on: ${issueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      297 / 2,
      140,
      {
        align: "center",
        baseline: "middle",
      }
    );

    doc.setFontSize(30);
    doc.setTextColor(0, 0, 0);
    doc.text(`Certificate Id: ${certificate_id}`, 297 / 2, 170, {
      align: "center",
      baseline: "middle",
    });

    // Return PDF as Buffer
    const arrayBuffer = doc.output("arraybuffer");
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate certificate PDF");
  }
};

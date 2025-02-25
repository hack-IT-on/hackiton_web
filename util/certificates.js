import { jsPDF } from "jspdf";
async function fetchFont(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return arrayBuffer;
}

export const generatePDF = async (
  templateUrl,
  userName,
  issueDate,
  eventName,
  certificate_id
) => {
  try {
    // Create PDF document
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Load default font
    doc.setFont("helvetica", "normal");

    // Helper function to fetch and convert image to base64
    const getImageAsBase64 = async (url) => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return `data:image/png;base64,${Buffer.from(arrayBuffer).toString(
        "base64"
      )}`;
    };

    // Fetch all images in parallel
    const [
      templateBase64,
      logo1Base64,
      logo2Base64,
      logo3Base64,
      signature1Base64,
      signature2Base64,
      signature3Base64,
    ] = await Promise.all([
      getImageAsBase64(templateUrl),
      getImageAsBase64(
        "https://hack-it-on.s3.eu-north-1.amazonaws.com/logos/BIT-logo+(2).png"
      ),
      getImageAsBase64("https://hackiton.vercel.app/logo.png"),
      getImageAsBase64(
        "https://hack-it-on.s3.eu-north-1.amazonaws.com/logos/Logo-1392644265.png"
      ),
      getImageAsBase64(
        "https://camo.githubusercontent.com/9ad27ae3c86b026112ff04e6a7c2f2004f556e93ee430b3f67228d1785e3b5fe/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f393837332f3236383034362f39636564333435342d386566632d313165322d383136652d6139623137306135313030342e706e67"
      ),
      getImageAsBase64(
        "https://camo.githubusercontent.com/9ad27ae3c86b026112ff04e6a7c2f2004f556e93ee430b3f67228d1785e3b5fe/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f393837332f3236383034362f39636564333435342d386566632d313165322d383136652d6139623137306135313030342e706e67"
      ),
      getImageAsBase64(
        "https://hack-it-on.s3.eu-north-1.amazonaws.com/signatures/sph_sign.png"
      ),
    ]);

    // Add template as background
    doc.addImage(templateBase64, "PNG", 0, 0, 297, 210);

    // Add logos at top with adjusted sizes
    const logoWidth = 25;
    const logoHeight = 25;
    const logoY = 20;

    // Adjusted logo positions
    doc.addImage(logo1Base64, "PNG", 55, logoY, 20, 20);
    doc.addImage(logo2Base64, "PNG", 133.5, logoY, 35, 15);
    doc.addImage(logo3Base64, "PNG", 212, logoY, logoWidth, logoHeight);

    // Certificate Title (moved up by additional 10mm)
    doc.setFontSize(35);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICATE", 148.5, 55, {
      align: "center",
    });

    doc.setFontSize(35);
    doc.text("OF PARTICIPATION", 148.5, 75, {
      align: "center",
    });

    // Reset font to normal for remaining text
    doc.setFont("helvetica", "normal");

    // Presented to text (moved up by additional 10mm)
    doc.setFontSize(18);
    doc.setTextColor(100, 100, 100);
    doc.text("Presented to", 148.5, 95, {
      align: "center",
    });

    // User name (moved up by additional 10mm)
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 0);
    doc.text(userName, 148.5, 110, {
      align: "center",
    });

    // Participation text (moved up by additional 10mm)
    doc.setFontSize(18);
    doc.setTextColor(100, 100, 95);
    doc.text("for successfully participating in", 148.5, 130, {
      align: "center",
    });

    // Event name (moved up by additional 10mm)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(31, 41, 55);
    doc.text(eventName, 148.5, 140, {
      align: "center",
    });

    // Reset font to normal for remaining text
    doc.setFont("helvetica", "normal");

    // Issue date (moved up by additional 10mm)
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    const dateText = `Issued on: ${issueDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;
    doc.text(dateText, 148.5, 150, {
      align: "center",
    });

    // Certificate ID (moved up by additional 10mm)
    doc.setFontSize(11);
    doc.setTextColor(90, 90, 90);
    doc.text(`Certificate ID: ${certificate_id}`, 148.5, 157, {
      align: "center",
    });

    // Digital signatures (keeping original position)
    const signatureWidth = 35;
    const signatureHeight = 25;
    const signatureY = 165;

    // Add signatures
    doc.addImage(
      signature1Base64,
      "PNG",
      55,
      signatureY,
      signatureWidth,
      signatureHeight
    );
    doc.addImage(
      signature2Base64,
      "PNG",
      133.5,
      signatureY,
      signatureWidth,
      signatureHeight
    );
    doc.addImage(
      signature3Base64,
      "PNG",
      212,
      signatureY,
      signatureWidth,
      signatureHeight
    );

    // Signature titles (keeping original position)
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text("Prof. Tapan Kumar Pal \n President of IIC 7.0", 72.5, 190, {
      align: "center",
    });
    doc.text("Prof. N.C. Ghosh \n Principal of the Institute", 151, 190, {
      align: "center",
    });
    doc.text(
      "Prof. Shanta Phani \n HOD & Associate Professor \n Department of CSE",
      229.5,
      190,
      { align: "center" }
    );

    const pdfBuffer = doc.output("arraybuffer");
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate certificate PDF");
  }
};

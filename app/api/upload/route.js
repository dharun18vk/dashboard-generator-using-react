import Papa from "papaparse";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) {
      return Response.json({ error: "Missing CSV file." }, { status: 400 });
    }

    const text = await file.text();
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header) => header.trim(),
    });

    if (parsed.errors?.length) {
      return Response.json(
        {
          error: "CSV parsing error.",
          details: parsed.errors.slice(0, 3),
        },
        { status: 400 }
      );
    }

    const columns = parsed.meta.fields || [];
    const rows = parsed.data || [];

    return Response.json({ columns, rows });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Upload failed." },
      { status: 500 }
    );
  }
}

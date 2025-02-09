import { NextResponse } from "next/server";
import axios from "axios";
import qs from "qs";

export async function POST(request) {
  try {
    const { code, language, input } = await request.json();
    const data = qs.stringify({
      code,
      language,
      input: input || "",
    });
    const config = {
      method: "post",
      url: "https://api.codex.jaagrav.in",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data,
    };
    const response = await axios(config);
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Code execution failed", details: error.message },
      { status: 500 }
    );
  }
}

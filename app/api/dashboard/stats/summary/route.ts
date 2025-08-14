import { NextRequest, NextResponse } from "next/server";
import UserSummary from "@/models/user-summary";
import getServerUser from "@/hooks/get-server-user";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { connectToDatabase } from "@/lib/db";



export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const sort = url.searchParams.get("sort") || "createdAt";

    if (page < 1 || limit < 1 || limit > 15) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const allowedSortFields = ["createdAt", "title", "length"];
    if (!allowedSortFields.includes(sort.replace("-", ""))) {
      return NextResponse.json(
        { error: "Invalid sort parameter" },
        { status: 400 }
      );
    }

    const session = await getServerUser();
    if (!session) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const userId = session.id;

    const total = await UserSummary.countDocuments({ userId });

    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    const sortObj: Record<string, 1 | -1> = {};
    if (sort.startsWith("-")) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const data = await UserSummary.find({ userId })
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const response = {
      data,
      currentPage: page,
      totalPages,
      total,
      nextPage,
      prevPage,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error fetching summary stats: ${error}`);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      },
      { status: 500 }
    );
  }
}
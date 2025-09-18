import { NextRequest, NextResponse } from "next/server";
import UserQuestions from "@/models/user-questions-schema";
import getServerUser from "@/hooks/get-server-user";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { connectToDatabase } from "@/lib/db";
import { Types } from "mongoose";

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

    const allowedSortFields = ["createdAt"];
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

    const userId = session.id as Types.ObjectId;

    const total = await UserQuestions.countDocuments({ userId });
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    const sortObj: Record<string, 1 | -1> = {};
    if (sort === "createdAt") {
      sortObj["createdAt"] = -1;
    } else if (sort.startsWith("-")) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const data = await UserQuestions.find({ userId })
    //   .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      data,
      currentPage: page,
      totalPages,
      total,
      nextPage,
      prevPage,
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import UserSummary from '@/models/user-summary';
import TermPaper from '@/models/term-paper';
import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { ERROR_MESSAGES } from "@/lib/error-messages";

export async function GET() {
    try {
        const session = await getServerUser();

        if (!session) {
            return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 });
        }

        await connectToDatabase();

        const userId = session.id;
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const allDocuments = await TermPaper.find({ userId });
        const documentsThisMonth = await TermPaper.find({
            userId,
            createdAt: { $gte: thisMonth }
        });
        const documentsLastMonth = await TermPaper.find({
            userId,
            createdAt: { $gte: lastMonth, $lt: thisMonth }
        });

        const allSummaries = await UserSummary.find({ userId });
        const summariesThisMonth = await UserSummary.find({
            userId,
            createdAt: { $gte: thisMonth }
        });
        const summariesLastMonth = await UserSummary.find({
            userId,
            createdAt: { $gte: lastMonth, $lt: thisMonth }
        });

        const totalDocuments = allDocuments.length;
        const totalSummaries = allSummaries.length;

        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const activeProjects = await TermPaper.countDocuments({
            userId,
            createdAt: { $gte: thirtyDaysAgo }
        });

        const documentChange = documentsThisMonth.length - documentsLastMonth.length;
        const summaryChange = summariesThisMonth.length - summariesLastMonth.length;

        const activeProjectsLastMonth = await TermPaper.countDocuments({
            userId,
            createdAt: { $gte: lastMonth, $lt: thisMonth }
        });
        const activeProjectChange = documentsThisMonth.length - activeProjectsLastMonth;

        const stats = {
            totalDocuments,
            totalSummaries,
            activeProjects,
            documentsThisMonth: documentsThisMonth.length,
            changes: {
                documents: documentChange,
                summaries: summaryChange,
                activeProjects: activeProjectChange,
            }
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
            { status: 500 }
        );
    }
}
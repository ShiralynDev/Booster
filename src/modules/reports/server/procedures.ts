import { z } from "zod";
import { db } from "@/db";
import { reports, reportVotes, users, videos } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, gt, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const reportsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      videoId: z.string().uuid(),
      reason: z.enum(['ai', 'clickbait', 'inappropriate', 'spam', 'harassment']),
      details: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { videoId, reason, details } = input;
      const userId = ctx.user.id;

      const [existingReport] = await db.select().from(reports).where(
        and(
            eq(reports.videoId, videoId),
            eq(reports.reason, reason),
            gt(reports.expiresAt, new Date())
        )
      ).limit(1);

      if (existingReport) {
        return { reportId: existingReport.id, created: false };
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);

      const [newReport] = await db.insert(reports).values({
        videoId,
        reporterId: userId,
        reason,
        details,
        expiresAt,
      }).returning();

      // Automatically vote "agree" for the reporter
      await db.insert(reportVotes).values({
        reportId: newReport.id,
        userId,
        voteType: 'agree'
      });

      // Check if we need to update the video status (e.g. if it's the first vote and it's AI)
      if (reason === 'ai') {
        // 1 vote, 1 agree = 100% > 66%
        await db.update(videos)
            .set({ isAi: true })
            .where(eq(videos.id, videoId));
      }

      return { reportId: newReport.id, created: true };
    }),

  getPolls: baseProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { videoId } = input;
      
      let userId;
      if (ctx.clerkUserId) {
        const [user] = await db.select().from(users).where(eq(users.clerkId, ctx.clerkUserId));
        if (user) {
            userId = user.id;
        }
      }

      const activeReports = await db.select().from(reports).where(
        and(
            eq(reports.videoId, videoId),
            gt(reports.expiresAt, new Date())
        )
      );

      if (activeReports.length === 0) return [];

      const reportIds = activeReports.map(r => r.id);
      const allVotes = await db.select().from(reportVotes).where(inArray(reportVotes.reportId, reportIds));

      const result = activeReports.map(report => {
          const votes = allVotes.filter(v => v.reportId === report.id);
          const agreeCount = votes.filter(v => v.voteType === 'agree').length;
          const disagreeCount = votes.filter(v => v.voteType === 'disagree').length;
          
          let userVote = null;
          if (userId) {
            const vote = votes.find(v => v.userId === userId);
            if (vote) userVote = vote.voteType;
          }

          return {
            ...report,
            agreeCount,
            disagreeCount,
            userVote
          };
      });

      return result;
    }),

  vote: protectedProcedure
    .input(z.object({
      reportId: z.string().uuid(),
      voteType: z.enum(['agree', 'disagree'])
    }))
    .mutation(async ({ ctx, input }) => {
      const { reportId, voteType } = input;
      const userId = ctx.user.id;

      const [report] = await db.select().from(reports).where(eq(reports.id, reportId)).limit(1);

      if (!report || new Date(report.expiresAt) < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Poll has ended or does not exist" });
      }

      await db.insert(reportVotes).values({
        reportId,
        userId,
        voteType
      }).onConflictDoUpdate({
        target: [reportVotes.reportId, reportVotes.userId],
        set: { voteType }
      });

      // Check if we need to update the video status
      const allVotes = await db.select().from(reportVotes).where(eq(reportVotes.reportId, reportId));
      const agreeCount = allVotes.filter(v => v.voteType === 'agree').length;
      const totalVotes = allVotes.length;
      
      if (totalVotes > 0) {
        const agreePercentage = (agreeCount / totalVotes) * 100;
        
        if (report.reason === 'ai') {
            const isAi = agreePercentage > 66;
            await db.update(videos)
                .set({ isAi })
                .where(eq(videos.id, report.videoId));
        }
      }

      return { success: true };
    })
});

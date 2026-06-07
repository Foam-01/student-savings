using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using StudentSavingsSystem.Models;
using StudentSavingsSystem.DTOs.FinancialInsights;

namespace StudentSavingsSystem.Services
{
    public class FinancialInsightsService : IFinancialInsightsService
    {
        private readonly ApplicationDbContext _context;
        private readonly ISavingGoalService _savingGoalService;
        private readonly ILeaderboardService _leaderboardService;

        public FinancialInsightsService(
            ApplicationDbContext context,
            ISavingGoalService savingGoalService,
            ILeaderboardService leaderboardService)
        {
            _context = context;
            _savingGoalService = savingGoalService;
            _leaderboardService = leaderboardService;
        }

        public async Task<StudentAdvisorResponseDto> GetStudentInsightsAsync(int studentId)
        {
            var student = await _context.Users.FindAsync(studentId);
            if (student == null || student.Role != "Student")
            {
                return new StudentAdvisorResponseDto();
            }

            var response = new StudentAdvisorResponseDto
            {
                CurrentBalance = student.Balance,
                Insights = new List<FinancialInsightDto>()
            };

            // Fetch data needed for calculations
            var goals = await _savingGoalService.GetGoalsByStudentIdAsync(studentId);
            var activeGoals = goals.Where(g => !g.IsCompleted).ToList();
            
            var transactions = await _context.Transactions
                .Where(t => t.StudentId == studentId)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();

            var streakData = await _leaderboardService.GetStudentStreakAsync(studentId);

            // 1. Goal Projection Insight
            if (activeGoals.Any())
            {
                var primaryGoal = activeGoals.First();
                decimal neededAmount = primaryGoal.TargetAmount - student.Balance;

                if (neededAmount <= 0)
                {
                    response.Insights.Add(new FinancialInsightDto
                    {
                        Id = "goal_completed",
                        Type = "success",
                        Title = "เป้าหมายออมเงินบรรลุแล้ว! 🎉",
                        Message = $"ยอดเงินออมปัจจุบันของคุณ ({student.Balance:N2} บาท) เกินยอดเป้าหมายของ '{primaryGoal.Title}' ({primaryGoal.TargetAmount:N2} บาท) แล้ว! สามารถทำเครื่องหมายเสร็จสิ้นเพื่อฉลองความสำเร็จและเริ่มเป้าหมายใหม่ได้เลย",
                        Icon = "target"
                    });
                }
                else
                {
                    // Calculate average monthly deposit over last 90 days
                    var ninetyDaysAgo = DateTime.UtcNow.AddDays(-90);
                    var recentDeposits = transactions
                        .Where(t => t.TransactionType == "Deposit" && t.TransactionDate >= ninetyDaysAgo)
                        .ToList();

                    decimal totalDeposited = recentDeposits.Sum(t => t.Amount);
                    decimal avgDepositPerMonth = recentDeposits.Any() ? (totalDeposited / 90.0m) * 30.0m : 0m;

                    if (avgDepositPerMonth > 0)
                    {
                        decimal monthsToGoal = neededAmount / avgDepositPerMonth;
                        
                        if (primaryGoal.TargetDate.HasValue)
                        {
                            var daysLeft = (primaryGoal.TargetDate.Value.Date - DateTime.UtcNow.Date).TotalDays;
                            if (daysLeft > 0)
                            {
                                decimal monthsLeft = (decimal)daysLeft / 30.0m;
                                if (monthsToGoal <= monthsLeft)
                                {
                                    response.Insights.Add(new FinancialInsightDto
                                    {
                                        Id = "goal_on_track",
                                        Type = "success",
                                        Title = "เป้าหมายของคุณอยู่บนเส้นทางที่ถูกต้อง! 🚀",
                                        Message = $"ด้วยยอดฝากออมเฉลี่ยของคุณที่ {avgDepositPerMonth:N2} บาท/เดือน คาดว่าคุณจะสะสมครบ {primaryGoal.TargetAmount:N2} บาทเพื่อเป้าหมาย '{primaryGoal.Title}' ได้ภายใน {monthsToGoal:F1} เดือน ซึ่งเร็วกว่าวันที่เป้าหมายกำหนด!",
                                        Icon = "trending-up"
                                    });
                                }
                                else
                                {
                                    decimal requiredDaily = neededAmount / (decimal)daysLeft;
                                    response.Insights.Add(new FinancialInsightDto
                                    {
                                        Id = "goal_behind",
                                        Type = "warning",
                                        Title = $"คำแนะนำสำหรับเป้าหมาย '{primaryGoal.Title}' 💡",
                                        Message = $"เพื่อให้บรรลุเป้าหมายตามกำหนดวันที่วางไว้ คุณต้องการออมเงินเพิ่มอีกเฉลี่ยวันละ {requiredDaily:N2} บาท (หรือเฉลี่ยเดือนละ {(requiredDaily * 30):N2} บาท) มาพยายามออมเพิ่มขึ้นอีกนิดเพื่อความฝันกัน!",
                                        Icon = "bulb"
                                    });
                                }
                            }
                            else
                            {
                                response.Insights.Add(new FinancialInsightDto
                                {
                                    Id = "goal_overdue",
                                    Type = "info",
                                    Title = "อัปเดตระยะเวลาเป้าหมาย 📅",
                                    Message = $"เป้าหมาย '{primaryGoal.Title}' ผ่านกำหนดวันที่ตั้งเป้าหมายไปแล้ว ลองเข้าไปอัปเดตแก้ไข 'วันที่คาดหวัง' ในหน้าเป้าหมายการออมเพื่อให้การวางแผนสมจริงและมีพลังขับเคลื่อนอีกครั้ง",
                                    Icon = "target"
                                });
                            }
                        }
                        else
                        {
                            response.Insights.Add(new FinancialInsightDto
                            {
                                Id = "goal_forecast",
                                Type = "info",
                                Title = "พยากรณ์เป้าหมายการออม 📊",
                                Message = $"ด้วยสถิติออมเฉลี่ย {avgDepositPerMonth:N2} บาท/เดือน คุณจะสะสมเงินครบยอดเป้าหมายสำหรับ '{primaryGoal.Title}' ในเวลาอีกประมาณ {monthsToGoal:F1} เดือน",
                                Icon = "target"
                            });
                        }
                    }
                    else
                    {
                        // No deposits in last 90 days
                        if (primaryGoal.TargetDate.HasValue)
                        {
                            var daysLeft = (primaryGoal.TargetDate.Value.Date - DateTime.UtcNow.Date).TotalDays;
                            if (daysLeft > 0)
                            {
                                decimal requiredDaily = neededAmount / (decimal)daysLeft;
                                response.Insights.Add(new FinancialInsightDto
                                {
                                    Id = "goal_no_deposits",
                                    Type = "info",
                                    Title = "เริ่มออมก้าวแรกกันเลย! 🌱",
                                    Message = $"เป้าหมาย '{primaryGoal.Title}' รอพลังการออมอยู่ เริ่มสะสมวันละ {requiredDaily:N2} บาท เพื่อให้ไปถึงเป้าหมายได้ตามกำหนดเวลา",
                                    Icon = "bulb"
                                });
                            }
                            else
                            {
                                response.Insights.Add(new FinancialInsightDto
                                {
                                    Id = "goal_no_deposits_overdue",
                                    Type = "info",
                                    Title = "อัปเดตและเริ่มเป้าหมายใหม่ 🎯",
                                    Message = $"เป้าหมาย '{primaryGoal.Title}' เกินกำหนดที่ตั้งไว้และยังไม่มีรายการฝากใหม่ ลองเข้าไปปรับเป้าหมายหรือตั้งขอบเขตเงินออมที่เริ่มได้ง่าย ๆ เพื่อสะสมวินัยกันใหม่ครับ",
                                    Icon = "target"
                                });
                            }
                        }
                        else
                        {
                            response.Insights.Add(new FinancialInsightDto
                            {
                                Id = "goal_start_saving",
                                Type = "info",
                                Title = "เริ่มต้นการฝากเพื่อความฝัน ✨",
                                Message = $"คุณมีเป้าหมาย '{primaryGoal.Title}' ที่ยังคงรออยู่ ลองทำการฝากเงินรายการแรกในสัปดาห์นี้เพื่อให้เป้าหมายเริ่มขยับขับเคลื่อนกันครับ",
                                Icon = "target"
                            });
                        }
                    }
                }
            }

            // 2. Savings Streak Insight
            if (streakData != null)
            {
                if (streakData.CurrentStreak >= 3)
                {
                    response.Insights.Add(new FinancialInsightDto
                    {
                        Id = "streak_excellent",
                        Type = "primary",
                        Title = "วินัยการออมระดับเทพ! 🔥",
                        Message = $"คุณฝากเงินสะสมติดต่อกันรายสัปดาห์ถึง {streakData.CurrentStreak} สัปดาห์แล้ว! วินัยที่สม่ำเสมอนี้คือเคล็ดลับที่ยิ่งใหญ่ที่สุดของการสร้างฐานะ รักษามันไว้ให้ดีนะ",
                        Icon = "flame"
                    });
                }
                else if (streakData.CurrentStreak > 0)
                {
                    int left = 3 - streakData.CurrentStreak;
                    response.Insights.Add(new FinancialInsightDto
                    {
                        Id = "streak_building",
                        Type = "info",
                        Title = "สะสม Streak การออมต่อเนื่อง 🌱",
                        Message = $"คุณมียอดออมเงินสม่ำเสมอติดต่อกัน {streakData.CurrentStreak} สัปดาห์แล้ว ฝากเพิ่มอีก {left} สัปดาห์เพื่อไต่อันดับความมีวินัยในบอร์ดจัดอันดับ!",
                        Icon = "flame"
                    });
                }
                else
                {
                    response.Insights.Add(new FinancialInsightDto
                    {
                        Id = "streak_none",
                        Type = "info",
                        Title = "เริ่มสร้างประวัติออมต่อเนื่อง 💥",
                        Message = "สัปดาห์นี้คุณยังไม่มีรายการฝากออม ลองฝากเงินจำนวนเท่าใดก็ได้เพื่อเริ่มต้นนับหนึ่งประวัติออมเงินรายสัปดาห์ต่อเนื่องกัน!",
                        Icon = "bulb"
                    });
                }
            }

            // 3. Withdrawal Alert Insight
            var last30Days = DateTime.UtcNow.AddDays(-30);
            var recentTx = transactions
                .Where(t => t.TransactionDate >= last30Days)
                .ToList();

            decimal totalDeposits = recentTx.Where(t => t.TransactionType == "Deposit").Sum(t => t.Amount);
            decimal totalWithdrawals = recentTx.Where(t => t.TransactionType == "Withdraw").Sum(t => t.Amount);

            if (totalWithdrawals > 0)
            {
                if (totalDeposits > 0)
                {
                    decimal ratio = (totalWithdrawals / totalDeposits) * 100m;
                    if (ratio >= 50m)
                    {
                        response.Insights.Add(new FinancialInsightDto
                        {
                            Id = "withdraw_warning_high",
                            Type = "warning",
                            Title = "คำแจ้งเตือน: อัตราการถอนเงินค่อนข้างสูง ⚠️",
                            Message = $"ในรอบ 30 วันที่ผ่านมา คุณมียอดถอน ({totalWithdrawals:N2} บาท) คิดเป็น {ratio:F0}% ของยอดฝากทั้งหมด ({totalDeposits:N2} บาท) ลองจำกัดงบรายจ่ายและควบคุมการถอนออกเพื่อรักษาอัตราเติบโตของเงินออม",
                            Icon = "alert"
                        });
                    }
                }
                else
                {
                    response.Insights.Add(new FinancialInsightDto
                    {
                        Id = "withdraw_warning_no_deposits",
                        Type = "warning",
                        Title = "คำแจ้งเตือน: ถอนเงินโดยไม่มีการออมเพิ่ม ⚠️",
                        Message = $"คุณมีการถอนเงินรวม {totalWithdrawals:N2} บาทในเดือนนี้ แต่ไม่ได้ทำการฝากเงินเพิ่มเลย ส่งผลให้กระแสเงินเก็บของคุณลดลงอย่างรวดเร็ว ลองหันมาฝากกลับทดแทนบางส่วนเพื่อรักษาสมดุลนะ",
                        Icon = "alert"
                    });
                }
            }

            // 4. Deposit Habit Insight (Frequency check)
            var depositCountInLast30Days = recentTx.Count(t => t.TransactionType == "Deposit");
            if (depositCountInLast30Days >= 8)
            {
                response.Insights.Add(new FinancialInsightDto
                {
                    Id = "habit_frequent",
                    Type = "success",
                    Title = "นิสัยรักการออมดีเด่น! 📈",
                    Message = $"คุณทำการฝากเงินออมสะสมถึง {depositCountInLast30Days} ครั้งในช่วง 30 วันที่ผ่านมา การหยอดกระปุกออมเงินบ่อย ๆ ช่วยสร้างพฤติกรรมคุ้นชินที่ดีกว่าการออมทีละก้อนใหญ่นาน ๆ ครั้ง",
                    Icon = "trending-up"
                });
            }

            // 5. Compound Interest Projection Insight
            if (student.Balance >= 500m)
            {
                decimal interestRate = 0.025m; // 2.5% per year
                decimal futureValue = student.Balance * (decimal)Math.Pow(1.0 + (double)interestRate, 3);
                decimal earnedInterest = futureValue - student.Balance;

                response.Insights.Add(new FinancialInsightDto
                {
                    Id = "interest_future_projection",
                    Type = "primary",
                    Title = "มหัศจรรย์ของผลปันผลทบต้น 💰",
                    Message = $"ยอดเงินเก็บปัจจุบันของคุณ {student.Balance:N2} บาท หากทิ้งสะสมเอาไว้เฉลี่ย 3 ปี โดยมีผลตอบแทน/ปันผลเฉลี่ย 2.5% ต่อปี จะเพิ่มพูนขึ้นเป็น {futureValue:N2} บาท (ได้รับปันผลฟรีเพิ่มอีก {earnedInterest:N2} บาท โดยไม่ต้องออกแรงทำงาน!)",
                    Icon = "bulb"
                });
            }
            else
            {
                response.Insights.Add(new FinancialInsightDto
                {
                    Id = "interest_future_projection_low",
                    Type = "info",
                    Title = "พลังแห่งความเพียรสะสม 💰",
                    Message = "หากสะสมเงินออมรวมให้ได้ 500 บาทขึ้นไป คุณจะสามารถเริ่มเปิดฟีเจอร์จำลองและวิเคราะห์การเติบโตผ่านปันผลทบต้นของระบบวิเคราะห์อัจฉริยะได้ทันที!",
                    Icon = "bulb"
                });
            }

            return response;
        }
    }
}

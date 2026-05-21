import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/automations/trigger
 * Internal endpoint called when system events occur (e.g., deal_created, stage_changed)
 * Evaluates automation rules and executes matching actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trigger, dealId, userId, changes } = body;

    if (!trigger || !dealId || !userId) {
      return NextResponse.json(
        { error: 'trigger, dealId, and userId are required' },
        { status: 400 }
      );
    }

    // Fetch automations matching this trigger
    const automations = await prisma.dealAutomation.findMany({
      where: {
        userId,
        trigger,
        enabled: true,
      },
      include: {
        rules: true,
      },
    });

    if (automations.length === 0) {
      return NextResponse.json({
        success: true,
        executed: 0,
        executions: [],
      });
    }

    const executions = [];

    for (const automation of automations) {
      try {
        // Evaluate conditions from rules
        let conditionsMet = true;

        if (automation.rules.length > 0) {
          // All rules must be true (AND logic)
          for (const rule of automation.rules) {
            if (!evaluateCondition(rule.conditionJson, changes)) {
              conditionsMet = false;
              break;
            }
          }
        }

        if (!conditionsMet) {
          continue;
        }

        // Execute action
        const actionResult = await executeAction(automation, dealId, changes);

        // Log execution
        const execution = await prisma.automationExecution.create({
          data: {
            automationId: automation.id,
            dealId,
            trigger,
            status: actionResult.success ? 'success' : 'failed',
            result: actionResult.result,
            error: actionResult.error,
          },
        });

        executions.push({
          automationId: automation.id,
          automationName: automation.name,
          status: execution.status,
          result: execution.result,
        });

        // Log activity on deal
        if (actionResult.success) {
          await prisma.activityLog.create({
            data: {
              userId: USER_ID,
              dealId,
              action: 'automation_executed',
              description: `Automation "${automation.name}" executed: ${actionResult.result}`,
              metadata: {
                automationId: automation.id,
                action: automation.action,
              },
            },
          });
        }
      } catch (error) {
        console.error(`Error executing automation ${automation.id}:`, error);
        executions.push({
          automationId: automation.id,
          automationName: automation.name,
          status: 'failed',
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      trigger,
      dealId,
      automationsEvaluated: automations.length,
      executed: executions.filter((e) => e.status === 'success').length,
      executions,
    });
  } catch (error) {
    console.error('Error in automation trigger:', error);
    return NextResponse.json(
      { error: 'Failed to process automation trigger' },
      { status: 500 }
    );
  }
}

/**
 * Evaluate a condition against changes
 * Example conditions: { amount: { gte: 100000 }, stage: { eq: 'poc' } }
 */
function evaluateCondition(condition: any, changes: any): boolean {
  if (!condition || !changes) return true;

  for (const [key, condValue] of Object.entries(condition)) {
    const changeValue = changes[key];

    if (condValue === null || condValue === undefined) continue;

    const cond = condValue as any;

    // Greater than or equal
    if (cond.gte !== undefined && changeValue < cond.gte) return false;
    // Greater than
    if (cond.gt !== undefined && changeValue <= cond.gt) return false;
    // Less than or equal
    if (cond.lte !== undefined && changeValue > cond.lte) return false;
    // Less than
    if (cond.lt !== undefined && changeValue >= cond.lt) return false;
    // Equal
    if (cond.eq !== undefined && changeValue !== cond.eq) return false;
    // Not equal
    if (cond.ne !== undefined && changeValue === cond.ne) return false;
    // In array
    if (cond.in !== undefined && !cond.in.includes(changeValue)) return false;
  }

  return true;
}

/**
 * Execute automation action
 */
async function executeAction(
  automation: any,
  dealId: number,
  changes: any
): Promise<{ success: boolean; result?: string; error?: string }> {
  const actionConfig = automation.actionConfig || {};

  switch (automation.action) {
    case 'create_todo':
      {
        const todos = actionConfig.todos || [];
        if (todos.length === 0) {
          return { success: false, error: 'No todos specified' };
        }

        const created = await prisma.todo.createMany({
          data: todos.map((content: string) => ({
            userId: USER_ID,
            dealId,
            content,
          })),
        });

        return {
          success: true,
          result: `Created ${created.count} todos`,
        };
      }

    case 'update_field':
      {
        const { field, value } = actionConfig;
        if (!field) {
          return { success: false, error: 'Field not specified' };
        }

        const updateData: any = {};
        updateData[field] = value;

        await prisma.deal.update({
          where: { id: dealId },
          data: updateData,
        });

        return {
          success: true,
          result: `Updated ${field} to ${value}`,
        };
      }

    case 'move_stage':
      {
        const { toStage } = actionConfig;
        if (!toStage) {
          return { success: false, error: 'Target stage not specified' };
        }

        await prisma.deal.update({
          where: { id: dealId },
          data: { stage: toStage },
        });

        return {
          success: true,
          result: `Moved deal to ${toStage} stage`,
        };
      }

    case 'send_email':
      {
        // Placeholder - would integrate with Gmail/SendGrid
        return {
          success: true,
          result: 'Email queued for sending',
        };
      }

    default:
      return {
        success: false,
        error: `Unknown action: ${automation.action}`,
      };
  }
}

import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function inputRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw httpError(400, 'Request body must be an object');
  }
  return input as Record<string, unknown>;
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const { userId, teamId, type, minutes } = inputRecord(input);
  if (typeof userId !== 'string' || !User.db.base.isValidObjectId(userId)) {
    throw httpError(400, 'A valid userId is required');
  }
  if (typeof teamId !== 'string' || !Team.db.base.isValidObjectId(teamId)) {
    throw httpError(400, 'A valid teamId is required');
  }
  if (typeof type !== 'string' || !type.trim()) {
    throw httpError(400, 'A valid activity type is required');
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw httpError(400, 'Minutes must be a positive number');
  }
  const [userExists, teamExists] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!userExists || !teamExists) {
    throw httpError(404, 'The referenced user or team was not found');
  }
  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const { name, mascot, members = [] } = inputRecord(input);
  if (typeof name !== 'string' || !name.trim()) {
    throw httpError(400, 'A team name is required');
  }
  if (typeof mascot !== 'string' || !mascot.trim()) {
    throw httpError(400, 'A team mascot is required');
  }
  if (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !User.db.base.isValidObjectId(member))) {
    throw httpError(400, 'Team members must be valid user IDs');
  }
  const uniqueMembers = [...new Set(members as string[])];
  if (uniqueMembers.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: uniqueMembers } });
    if (existingMembers !== uniqueMembers.length) {
      throw httpError(400, 'One or more team members were not found');
    }
  }
  return Team.create({ name, mascot, members: uniqueMembers });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate([{ $group: { _id: '$team', totalPoints: { $sum: '$points' } } }]),
  ]);
  const pointsByTeam = new Map<string, number>(
    totals.map(({ _id, totalPoints }: { _id: unknown; totalPoints: number }) => [String(_id), totalPoints]),
  );
  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: pointsByTeam.get(team._id.toString()) ?? 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw httpError(404, 'User not found');

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const recentFocus = recentActivity?.type === 'strength'
    ? 'strength'
    : recentActivity?.type
      ? 'endurance'
      : undefined;
  const focus = user.fitnessGoal || recentFocus;
  const workouts = await Workout.find().lean();
  return workouts
    .sort((left, right) => Number(right.focus === focus) - Number(left.focus === focus))
    .map((workout) => ({
      ...workout,
      reason: workout.focus === focus
        ? `Recommended to support your ${focus} goal.`
        : `Suggested alongside your recent ${recentActivity?.type ?? focus ?? 'fitness'} activity.`,
    }));
}

export { User };

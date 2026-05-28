import { auth } from "@clerk/nextjs/server";
import connectToDB from "@/lib/connectToDB";
import CategoryModel from "@/app/Models/CategorySchema";
import TaskModel from "@/app/Models/TaskSchema";
import WeeklyDashboardClient from "@/app/components/dashboard/WeeklyDashboardClient";
import Sidebar from "@/app/components/SideBar/Sidebar";
import { Category, Task } from "@/Types/DashboardTypes";
import { formatDateToBangladeshYMD, parseBangladeshYMD } from "@/lib/dateUtils";

type SeedCategory = {
  name: string;
  color: string;
};

type SeedTask = {
  title: string;
  weight: number;
  completed: boolean;
  categoryName: string;
};

const DEFAULT_CATEGORIES: SeedCategory[] = [
  { name: "Study", color: "purple" },
  { name: "Health", color: "emerald" },
  { name: "Coding", color: "orange" },
  { name: "Reading", color: "pink" },
];

const DEFAULT_WEEK_TASKS: SeedTask[][] = [
  [
    { title: "DSA Practice", weight: 8, completed: true, categoryName: "Study" },
    { title: "Morning Run", weight: 4, completed: false, categoryName: "Health" },
    { title: "React Component", weight: 6, completed: true, categoryName: "Coding" },
  ],
  [
    { title: "Book Summary", weight: 3, completed: true, categoryName: "Reading" },
    { title: "Gym Session", weight: 4, completed: true, categoryName: "Health" },
    { title: "API Integration", weight: 7, completed: false, categoryName: "Coding" },
  ],
  [
    { title: "Statistics", weight: 5, completed: true, categoryName: "Study" },
    { title: "Yoga", weight: 3, completed: false, categoryName: "Health" },
    { title: "Code Review", weight: 6, completed: true, categoryName: "Coding" },
  ],
  [
    { title: "Read Chapter", weight: 4, completed: true, categoryName: "Reading" },
    { title: "Algorithms Review", weight: 7, completed: false, categoryName: "Study" },
    { title: "Bug Fixes", weight: 5, completed: true, categoryName: "Coding" },
  ],
  [
    { title: "Calculus Problem Set", weight: 6, completed: true, categoryName: "Study" },
    { title: "Swimming", weight: 4, completed: false, categoryName: "Health" },
    { title: "React Component", weight: 6, completed: true, categoryName: "Coding" },
  ],
  [
    { title: "Morning Run", weight: 3, completed: true, categoryName: "Health" },
    { title: "Book Summary", weight: 4, completed: false, categoryName: "Reading" },
    { title: "API Integration", weight: 7, completed: true, categoryName: "Coding" },
  ],
  [
    { title: "DSA Practice", weight: 8, completed: true, categoryName: "Study" },
    { title: "Yoga", weight: 3, completed: false, categoryName: "Health" },
    { title: "Read Chapter", weight: 4, completed: true, categoryName: "Reading" },
  ],
];

function getWeekDateRange(): string[] {
  const dates: string[] = [];
  const today = parseBangladeshYMD(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    dates.push(formatDateToBangladeshYMD(date));
  }

  return dates;
}

async function ensureDefaultCategories(userId: string) {
  const existing = await CategoryModel.find({ clerkId: userId })
    .select("-__v -_id -createdAt -updatedAt")
    .lean();

  if (existing.length > 0) {
    return existing as Category[];
  }

  const created = await CategoryModel.create(
    DEFAULT_CATEGORIES.map((category) => ({
      clerkId: userId,
      name: category.name,
      color: category.color,
    })),
  );

  return created.map((category) => ({
    id: category.id,
    name: category.name,
    color: category.color,
  }));
}

async function seedDefaultTasks(userId: string, categories: Category[]) {
  const weekDates = getWeekDateRange();
  const categoryMap = new Map(categories.map((category) => [category.name, category.id]));

  const tasks: Array<{
    clerkId: string;
    title: string;
    weight: number;
    completed: boolean;
    categoryId: string;
    date: string;
  }> = [];

  weekDates.forEach((date, index) => {
    const dayTasks = DEFAULT_WEEK_TASKS[index] || [];
    dayTasks.forEach((task) => {
      tasks.push({
        clerkId: userId,
        title: task.title,
        weight: task.weight,
        completed: task.completed,
        categoryId: categoryMap.get(task.categoryName) ?? categories[0]?.id,
        date,
      });
    });
  });

  const createdTasks = await TaskModel.create(tasks);
  return createdTasks.map((task) => ({
    id: task.id,
    title: task.title,
    weight: task.weight,
    completed: task.completed,
    categoryId: task.categoryId,
    date: task.date,
  }));
}

export default async function Page() {
  const { userId } = await auth();
  if (!userId) {
    return <div className="p-10 text-white">Please sign in to view the weekly dashboard.</div>;
  }

  await connectToDB();

  const weekDateRange = getWeekDateRange();
  const categories = await ensureDefaultCategories(userId);

  let tasks: Task[] = await TaskModel.find({ clerkId: userId, date: { $in: weekDateRange } })
    .select("-__v -_id -createdAt -updatedAt")
    .lean() as Task[];

  if (!tasks.length) {
    tasks = await seedDefaultTasks(userId, categories);
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-linear-to-br from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <WeeklyDashboardClient
            categories={categories as Category[]}
            tasks={tasks as Task[]}
            weekDateRange={weekDateRange}
          />
        </div>
      </div>
    </div>
  );
}

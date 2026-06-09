import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectToDB from "@/lib/connectToDB";
import Note from "@/app/Models/NoteSchema";
import Sidebar from "@/app/components/SideBar/Sidebar";
import NotesClient from "@/app/components/notes/NotesClient";

export const metadata = {
  title: "Goals and Notes - Productivity Dashboard",
  description: "Write your goals and notes for different time periods",
};

export default async function GoalsAndNotesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  await connectToDB();

  // Fetch all notes for the user
  const notesData = await Note.find({ clerkId: userId })
    .sort({ updatedAt: -1 })
    .lean();

  const notes = notesData.map((note: any) => ({
    _id: note._id.toString(),
    title: note.title,
    content: note.content,
    imageUrl: note.imageUrl,
    period: note.period,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }));

  return (
    <div className="min-h-screen flex bg-black">
      <Sidebar />
      <main className="flex-1 p-6 bg-black overflow-hidden flex flex-col">
        <NotesClient initialNotes={notes} />
      </main>
    </div>
  );
}

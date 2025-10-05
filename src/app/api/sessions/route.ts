import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Session from "@/models/Session";
import Question from "@/models/Question";

export async function GET() {
    try {
        await connectToDB();
        const sessions = await Session.find();
        
        // Récupérer les questions complètes pour chaque session
        const sessionsWithQuestions = await Promise.all(
            sessions.map(async (session) => {
                const questions = await Question.find({ _id: { $in: session.questions } });
                return {
                    ...session.toObject(),
                    questions: questions
                };
            })
        );
        
        return NextResponse.json(sessionsWithQuestions);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDB();
        const { designation, statut, questions, coursId } = await request.json();
        
        // Calculer automatiquement le maximum basé sur les questions
        const maximum = questions && Array.isArray(questions) 
            ? questions.reduce((total: number, q: any) => total + (q.pts || 0), 0)
            : 0;
        
        const session = await Session.create({ 
            designation, 
            statut, 
            questions: questions || [], 
            coursId, 
            maximum 
        });
        return NextResponse.json(session);
    } catch (error) {
        console.error("Error creating session:", error);
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await connectToDB();
        const { id, designation, statut, questions, coursId } = await request.json();
        
        // Calculer automatiquement le maximum basé sur les questions
        const maximum = questions && Array.isArray(questions) 
            ? questions.reduce((total: number, q: any) => total + (q.pts || 0), 0)
            : 0;
        
        const session = await Session.findByIdAndUpdate(id, { 
            designation, 
            statut, 
            questions: questions || [], 
            coursId, 
            maximum 
        }, { new: true });
        
        // Récupérer les questions complètes
        const fullQuestions = await Question.find({ _id: { $in: session.questions } });
        const sessionWithQuestions = {
            ...session.toObject(),
            questions: fullQuestions
        };
        
        return NextResponse.json(sessionWithQuestions);
    } catch (error) {
        console.error("Error updating session:", error);
        return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectToDB();
        const { id } = await request.json();
        const session = await Session.findByIdAndDelete(id);
        return NextResponse.json(session);
    } catch (error) {
        console.error("Error deleting session:", error);
        return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
    }
}
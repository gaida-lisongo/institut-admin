import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Cours from "@/models/Cours";

export async function GET() {
    try {
        await connectToDB();
        const cours = await Cours.find();
        return NextResponse.json(cours);
    } catch (error) {
        console.error("Error fetching cours:", error);
        return NextResponse.json({ error: "Failed to fetch cours" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDB();
        const { designation, credit, unite } = await request.json();
        const cours = await Cours.create({ designation, credit, unite });
        return NextResponse.json(cours);
    } catch (error) {
        console.error("Error creating cours:", error);
        return NextResponse.json({ error: "Failed to create cours" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await connectToDB();
        const { id, designation, credit, unite } = await request.json();
        const cours = await Cours.findByIdAndUpdate(id, { designation, credit, unite });
        return NextResponse.json(cours);
    } catch (error) {
        console.error("Error updating cours:", error);
        return NextResponse.json({ error: "Failed to update cours" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectToDB();
        const { id } = await request.json();
        const cours = await Cours.findByIdAndDelete(id);
        return NextResponse.json(cours);
    } catch (error) {
        console.error("Error deleting cours:", error);
        return NextResponse.json({ error: "Failed to delete cours" }, { status: 500 });
    }
}

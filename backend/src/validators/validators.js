import z from "zod";

// user validation  
export const userSchema = z.object({
    email: z.string().email(),
    username: z.string().min(4),
    password: z.string().min(6),
    name: z.string().max(10).min(3)
})

export const userLogin = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

// task validation
export const taskSchema = z.object({
    title: z.string().max(50),
    description: z.string().max(100),
    cycles_required: z.number().min(1),
    cycles_completed: z.number().min(0),
    time_elapsed: z.number().min(0),
    status: z.enum(["pending", "completed"]),
    deleted: z.boolean()
})

// task update validation
export const updateTaskSchema = taskSchema.partial();
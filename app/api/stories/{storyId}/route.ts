// import { NextRequest, NextResponse } from 'next/server';
// import { updateStory } from '@/lib/db/stories';
// import { refreshStoryValidationSchema } from '@/lib/validation/story';
// import { getUserFromToken } from '@/lib/auth/getUserFromToken';
// import { isValidObjectId } from 'mongoose';
// import { uploadFile } from '@/lib/upload/uploadFile'; // cloudinary / local etc.

// // -------- PATCH /api/stories/[id] -------------
// export async function PATCH(req: NextRequest, { params }) {
//   try {
//     const id = params.id;

//     // 1. Validate ID
//     if (!isValidObjectId(id)) {
//       return NextResponse.json(
//         { status: 400, message: 'Invalid ID' },
//         { status: 400 }
//       );
//     }

//     // 2. Authorization — get user
//     const user = await getUserFromToken(req);
//     if (!user) {
//       return NextResponse.json(
//         { status: 401, message: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     // 3. Read multipart/form-data
//     const form = await req.formData();
//     const imgFile = form.get('img') as File | null;

//     // Body fields except file
//     const updateBody: any = {};
//     form.forEach((value, key) => {
//       if (key !== 'img') updateBody[key] = value;
//     });

//     // 4. Validate body (Zod/Yup)
//     const validation = refreshStoryValidationSchema.safeParse(updateBody);
//     if (!validation.success) {
//       return NextResponse.json(
//         { status: 400, message: validation.error.errors },
//         { status: 400 }
//       );
//     }

//     // 5. Upload file if exists
//     let uploadedImg = null;
//     if (imgFile) {
//       uploadedImg = await uploadFile(imgFile); // return URL
//     }

//     // 6. Update DB
//     const updatedStory = await updateStory(
//       id,
//       user._id,
//       uploadedImg,
//       updateBody
//     );

//     if (!updatedStory) {
//       return NextResponse.json(
//         { status: 404, message: 'Story not found or not yours' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       status: 200,
//       message: 'Update story successfully!',
//       data: updatedStory,
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { status: 500, message: 'Server error' },
//       { status: 500 }
//     );
//   }
// }

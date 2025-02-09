import { liveblocks } from "@/lib/liveblocks";
import { getUserColor } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function POST() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const {id, firstName, lastName, emailAddresses, imageUrl} = clerkUser

  // console.log("User", clerkUser);

  const user = {
    id,
    info:{
        id,
        name: `${firstName} ${lastName}`,
        email: emailAddresses[0].emailAddress,
        avatar: imageUrl,
        color : getUserColor(id)

    }
  }

  // Identify the user and return the result
  const { status, body } = await liveblocks.identifyUser(
    {
      userId: user.info.id,
      groupIds : []
    },
    { userInfo: user.info }
  );

  // console.log("Identify user", body);
  // console.log("Status", status);

  return new Response(body, { status });
}

import CollaborativeRoom from '@/components/ui/CollaborativeRoom'
import { getDocument } from '@/lib/actions/room.actions';
import { getClerkUsers } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';
import React from 'react'

const Document = async ({ params }: SearchParamProps) => {
  //TODO:
  const { id } = await params;
  const clerkuser = await currentUser();

  if (!clerkuser) {
    redirect("/sign-in");
  }

  // console.log('Mail', clerkuser.emailAddresses[0].emailAddress);

  const room = await getDocument({
    roomId: id,
    userId: clerkuser.emailAddresses[0].emailAddress
  })

  if (!room) {
    redirect("/")
  }

  const userIds = Object.keys(room.usersAccesses);
  const users = await getClerkUsers({ userIds });

  // console.log('Users ', users);
  // console.log("UserIds ", userIds);

  const usersData = users?.map((user: User) => ({
    ...user,
    userType: room.usersAccesses[user.email]?.includes('room:write')
      ? 'editor'
      : 'viewer'
  }))

  // console.log('UsersData', usersData);
  // console.log('Room', room);

  const currentUserType = room.usersAccesses[clerkuser.emailAddresses[0].emailAddress]?.includes('room:write') ? 'editor' : 'viewer';
  // console.log('CurrentUserType', currentUserType);
  
  return (
    <main className='flex w-full flex-col items-center'>
      <CollaborativeRoom
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType}
      />
    </main>
  )
}

export default Document
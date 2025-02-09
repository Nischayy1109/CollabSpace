"use client"

import { ClientSideSuspense, RoomProvider } from '@liveblocks/react'
import React, { useEffect, useRef, useState } from 'react'
import Header from '../Header'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { Editor } from '../editor/Editor'
import ActiveCollaborators from '@/ActiveCollaborators'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { updateDocument } from '@/lib/actions/room.actions'
import Loader from '../Loader'
import ShareModal from '../ShareModal'
import { LiveMap } from '@liveblocks/client'
import { StorageTldraw } from '../StorageTldraw'

function CollaborativeRoom({ roomId, roomMetadata, users, currentUserType }: CollaborativeRoomProps) {
    const [editing, setEditing] = useState(false)
    const [loading, setloading] = useState(false)
    const [documentTitle, setDocumentTitle] = useState(roomMetadata.title)

    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const updateTitleHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setloading(true)

            try {
                if (documentTitle !== roomMetadata.title) {
                    // update the document title
                    const updatedDocument = await updateDocument(roomId, documentTitle)
                    if (updatedDocument) {
                        setDocumentTitle(updatedDocument.metadata.title)
                    }

                    if (updatedDocument)
                        setloading(false)
                }
            } catch (error) {
                console.error(error)
            }

            setEditing(false)
        }
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setEditing(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [roomId, documentTitle])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setEditing(false);
                updateDocument(roomId, documentTitle);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [roomId, documentTitle])

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing])


    return (
        <RoomProvider id={roomId} initialPresence={{ presence: undefined }}
            initialStorage={{
                records: new LiveMap(),
            }}>
            <ClientSideSuspense fallback={<Loader />}>

                <div className='collaborative-room w-full' >
                    <Header>
                        <div ref={containerRef} className="flex w-fit items-center justify-center gap-2">
                            {editing && !loading
                                ? (
                                    <Input
                                        type='text'
                                        value={documentTitle}
                                        ref={inputRef}
                                        placeholder='Enter document title'
                                        onChange={(e) => setDocumentTitle(e.target.value)}
                                        onKeyDown={updateTitleHandler}
                                        disabled={!editing}
                                        className="document-title-input" />
                                )
                                :
                                (
                                    <>
                                        <p className='document-title'>{documentTitle}</p>
                                    </>
                                )
                            }

                            {currentUserType === 'editor' && !editing && (
                                <Image
                                    src='/assets/icons/edit.svg'
                                    alt='edit'
                                    width={24}
                                    height={24}
                                    onClick={() => setEditing(true)}
                                    className='pointer'
                                />
                            )}

                            {currentUserType !== 'editor' && !editing && (
                                <p className='view-only-tag'>View Only</p>
                            )}

                            {loading && <p className='text-sm text-gray-400'>Saving...</p>}

                        </div>

                        <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
                            <ActiveCollaborators />

                            <ShareModal
                                roomId={roomId}
                                collaborators={users}
                                creatorId={roomMetadata.creatorId}
                                currentUserType={currentUserType}
                            />

                            <SignedOut>
                                <SignInButton />
                            </SignedOut>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </div>

                    </Header>
                </div>

                <div className="w-full flex flex-col md:flex-row h-full">

                <div className="w-full md:w-1/2 h-1/2 md:h-full">
                <Editor
                            roomId={roomId}
                            currentUserType={currentUserType} />
                    </div>

                    <div className="w-full md:w-1/2 h-1/2 md:h-full">
                    <StorageTldraw />
                    </div>

                </div>


            </ClientSideSuspense >
        </RoomProvider >
    )
}

export default CollaborativeRoom
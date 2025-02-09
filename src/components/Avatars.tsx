"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";
import styles from "./Avatars.module.css";
import Image from "next/image";

export function Avatars() {
  const users = useOthers();
  const currentUser = useSelf();

  return (
    <div className={styles.avatars}>
      {users.map(({ connectionId, info }) => {
        return (
          <Avatar key={connectionId} picture={info.avatar} name={info.name} />
        );
      })}

      {currentUser && (
        <Avatar
          picture={currentUser.info.avatar}
          name={currentUser.info.name}
        />
      )}
    </div>
  );
}

export function Avatar({ picture, name }: { picture: string; name: string }) {
  return (
    <div className={styles.avatar} data-tooltip={name}>
      <Image
        alt={name}
        src={picture}
        className={styles.avatar_picture}
        data-tooltip={name}
        height={36}
        width={36}
      />
    </div>
  );
}

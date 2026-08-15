import type { RelationshipState } from "./types";

interface FriendshipLike {
  id: number;
  requesterId: string;
  addresseeId: string;
  status: "pending" | "accepted";
}

export function getFriendshipPairKey(
  firstUserId: string,
  secondUserId: string,
) {
  return [firstUserId, secondUserId].sort().join(":");
}

export function getOtherUserId(
  friendship: Pick<FriendshipLike, "requesterId" | "addresseeId">,
  currentUserId: string,
) {
  return friendship.requesterId === currentUserId
    ? friendship.addresseeId
    : friendship.requesterId;
}

export function getRelationship(
  friendship: FriendshipLike | undefined,
  currentUserId: string,
  targetUserId: string,
): { state: RelationshipState; id: number | null } {
  if (currentUserId === targetUserId) {
    return { state: "self", id: null };
  }

  if (!friendship) {
    return { state: "none", id: null };
  }

  if (friendship.status === "accepted") {
    return { state: "friends", id: friendship.id };
  }

  return {
    state:
      friendship.requesterId === currentUserId
        ? "outgoing_pending"
        : "incoming_pending",
    id: friendship.id,
  };
}

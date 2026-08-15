export type RelationshipState =
  | "self"
  | "none"
  | "outgoing_pending"
  | "incoming_pending"
  | "friends";

export interface PublicPlayer {
  userId: string;
  name: string;
  points: number;
  avatarUrl: string | null;
  joinedAt: string;
  relationship: RelationshipState;
  relationshipId: number | null;
}

export interface FriendRequestItem {
  requestId: number;
  createdAt: string;
  player: PublicPlayer;
}

export interface FriendListItem extends PublicPlayer {
  friendsSince: string;
}

export interface FriendsResponse {
  friends: FriendListItem[];
  total: number;
}

export interface FriendRequestsResponse {
  incoming: FriendRequestItem[];
  outgoing: FriendRequestItem[];
}

export interface PlayerProfileResponse {
  player: PublicPlayer & {
    stats: {
      completedExercises: number;
      enrolledCourses: number;
      friends: number;
    };
    courses: Array<{
      id: number;
      title: string;
      level: string;
      xpEarned: number;
    }>;
  };
}

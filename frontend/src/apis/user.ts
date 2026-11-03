import axios from "axios";

export type UserSearchResult = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  avatarColor?: {
    name: string;
    color: string;
    backgroundColor: string;
  } | null;
  role?: string;
};

const searchUsers = async (query: string) => {
  return axios.get<UserSearchResult[]>("/User/search", {
    params: { q: query },
  });
};

export { searchUsers };

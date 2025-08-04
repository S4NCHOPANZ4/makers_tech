export const fetchUsersData = async () => {
  const res = await fetch("http://localhost:3030/apiv1/user", {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  return data;
};

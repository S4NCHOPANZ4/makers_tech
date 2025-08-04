export const fetchAdminData = async () => {
  const res = await fetch("http://localhost:3030/apiv1/admin", {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  return data;
};

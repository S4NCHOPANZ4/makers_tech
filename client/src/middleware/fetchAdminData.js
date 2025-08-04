export const fetchAdminData = async () => {
  const res = await fetch("https://makers-tech-sv.onrender.com/apiv1/admin", {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  return data;
};

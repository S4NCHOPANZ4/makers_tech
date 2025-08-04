export const fetchItemsData = async () => {
  const res = await fetch("https://makers-tech-sv.onrender.com/apiv1/items", {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  return data;
};

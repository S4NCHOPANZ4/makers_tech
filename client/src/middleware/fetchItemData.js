export const fetchItemsData = async () => {
  const res = await fetch("http://localhost:3030/apiv1/items", {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  return data;
};

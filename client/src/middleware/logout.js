export const logout = async () => {
  const res = await fetch('http://localhost:3030/api/logout', {
    method: 'POST',
    credentials: 'include'
  });
  const data = await res.json();
  return data;
};

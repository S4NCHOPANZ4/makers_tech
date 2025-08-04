export const logout = async () => {
  const res = await fetch('https://makers-tech-sv.onrender.com/api/logout', {
    method: 'POST',
    credentials: 'include'
  });
  const data = await res.json();
  return data;
};

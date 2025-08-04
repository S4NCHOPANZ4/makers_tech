// checkSession.js
export const checkSession = async () => {
  const res = await fetch('https://makers-tech-sv.onrender.com/api/check-session', {
    method: 'GET',
    credentials: 'include', 
  });
  const data = await res.json();
  return data;
};

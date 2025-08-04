export const createGuestSession = async () => {
  const res = await fetch('https://makers-tech-sv.onrender.com/api/guest-session', {
    method: 'POST',
    credentials: 'include', 
  });
  const data = await res.json();
  console.log(data);
  return data;
};

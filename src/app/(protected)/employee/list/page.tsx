type User = {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string;
};

export default async function UsersPage() {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay
    const res = await fetch('https://jsonplaceholder.typicode.com/users');

    if (!res.ok) {
        throw new Error('Failed to fetch users');
    }

    const users: User[] = await res.json();

    return (
        <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <h1>Users List</h1>

                <ul className="space-y-4 p-4 text-black">
                    {users.map((user: User) => (
                        <li key={user.id}>
                            <h2>{user.name}</h2>
                            <p>Username: {user.username}</p>
                            <p>Email: {user.email}</p>
                            <p>Phone: {user.phone}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
print("Testing Memory Graph Extension")

students = ['Alice', 'Bob', 'Charlie']
scores = {'Alice': 95, 'Bob': 87, 'Charlie': 92}

average = sum(scores.values()) / len(scores)
print(f"Average: {average}")

# Create reference
backup = students
backup.append('Diana')

print(f"Students: {students}")
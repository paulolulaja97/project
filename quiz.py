import random
import json

def player_info():
    name = input("what is your name: ")
    return name


def high_score(name, difficulty, score):
    main_high_score = {
            "name": name,
            "score": score,
            "difficulty": difficulty
        }
    
    high_scores.append(main_high_score)
    save_high_score()
    

def view_high_score():
    sorted_high_scores = sorted(high_scores, key=lambda data:data["score"], reverse=True)
    if not high_scores:
        print("no high score yet")
    else:
        print(f"========================= HIGH SCORE =========================")        
        for position, data in enumerate(sorted_high_scores[:3], start=1):
            print(f"Name: {data['name']} | Score: {data['score']} | Difficulty: {data['difficulty']} | Rank: {position}")
        print(f"==============================================================")        

def level_selections():
    while True:
        level = input("what difficulty level did you want \n1 for easy \n2 for medium \n3 for hard: ")
        if level == "1":
            return "easy"
        elif level == "2":
            return "medium"
        elif level == "3":
            return "hard"
        else:
            print("invalid input")

def main_menu():
    name = player_info()
    print(f"WELCOME {name}")
    while True:
        user_choice = input("what did you want to do \n1 to play game \n2 to view high score \n3 to exit: ")
        if user_choice == "1":            
            difficulty = level_selections()
            print("======== Quiz Game ========")
            while True:
                play_game(name, difficulty)
                option = input("do you still want to play y/n: ").upper().strip()
                if option == "Y":
                    print("new game")
                elif option == "N":
                    break
                else:
                    print("invalid input")
                    continue
        elif user_choice == "2":
            view_high_score()
        elif user_choice == "3":
            print("exiting..........")
            break
        else:
            print("Invalid input")
        


def question_bank():
        
    question_bank = [
        # ==================== GENERAL KNOWLEDGE ====================

    {
        "questions": "How many continents are there in the world?",
        "multiple_choice": ["A. 5", "B. 6", "C. 7", "D. 8"],
        "actual_answer": "C",
        "difficulty": "easy",
        "category": "general"
    },
    {
        "questions": "How many days are there in a week?",
        "multiple_choice": ["A. 5", "B. 6", "C. 7", "D. 8"],
        "actual_answer": "C",
        "difficulty": "easy",
        "category": "general"
    },
    {
        "questions": "Which language has the most native speakers worldwide?",
        "multiple_choice": ["A. English", "B. Mandarin Chinese", "C. Spanish", "D. Hindi"],
        "actual_answer": "B",
        "difficulty": "medium",
        "category": "general"
    },
    {
        "questions": "Which instrument is used to measure temperature?",
        "multiple_choice": ["A. Barometer", "B. Thermometer", "C. Hygrometer", "D. Anemometer"],
        "actual_answer": "B",
        "difficulty": "medium",
        "category": "general"
    },
    {
        "questions": "Who wrote the play Romeo and Juliet?",
        "multiple_choice": ["A. Charles Dickens", "B. William Shakespeare", "C. Mark Twain", "D. George Orwell"],
        "actual_answer": "B",
        "difficulty": "hard",
        "category": "general"
    },
    {
        "questions": "Which ancient wonder was located in Alexandria?",
        "multiple_choice": ["A. Hanging Gardens of Babylon", "B. Lighthouse of Alexandria", "C. Colossus of Rhodes", "D. Temple of Artemis"],
        "actual_answer": "B",
        "difficulty": "hard",
        "category": "general"
    },


    # ==================== SCIENCE ====================

    {
        "questions": "What gas do humans need to breathe to survive?",
        "multiple_choice": ["A. Carbon dioxide", "B. Oxygen", "C. Nitrogen", "D. Hydrogen"],
        "actual_answer": "B",
        "difficulty": "easy",
        "category": "science"
    },
    {
        "questions": "What is the center of an atom called?",
        "multiple_choice": ["A. Electron", "B. Proton", "C. Nucleus", "D. Neutron"],
        "actual_answer": "C",
        "difficulty": "easy",
        "category": "science"
    },
    {
        "questions": "What is the chemical symbol for sodium?",
        "multiple_choice": ["A. So", "B. Sd", "C. Na", "D. S"],
        "actual_answer": "C",
        "difficulty": "medium",
        "category": "science"
    },
    {
        "questions": "Which organ pumps blood around the human body?",
        "multiple_choice": ["A. Liver", "B. Brain", "C. Heart", "D. Kidney"],
        "actual_answer": "C",
        "difficulty": "medium",
        "category": "science"
    },
    {
        "questions": "What is the hardest natural substance on Earth?",
        "multiple_choice": ["A. Iron", "B. Diamond", "C. Quartz", "D. Granite"],
        "actual_answer": "B",
        "difficulty": "hard",
        "category": "science"
    },
    {
        "questions": "What is the approximate speed of light in a vacuum?",
        "multiple_choice": ["A. 30,000 km/s", "B. 150,000 km/s", "C. 300,000 km/s", "D. 3,000,000 km/s"],
        "actual_answer": "C",
        "difficulty": "hard",
        "category": "science"
    },


    # ==================== GEOGRAPHY ====================

    {
        "questions": "What is the capital city of Nigeria?",
        "multiple_choice": ["A. Lagos", "B. Kano", "C. Abuja", "D. Ibadan"],
        "actual_answer": "C",
        "difficulty": "easy",
        "category": "geography"
    },
    {
        "questions": "Which continent is Nigeria located in?",
        "multiple_choice": ["A. Asia", "B. Africa", "C. Europe", "D. South America"],
        "actual_answer": "B",
        "difficulty": "easy",
        "category": "geography"
    },
    {
        "questions": "Which is the largest ocean on Earth?",
        "multiple_choice": ["A. Atlantic Ocean", "B. Indian Ocean", "C. Arctic Ocean", "D. Pacific Ocean"],
        "actual_answer": "D",
        "difficulty": "medium",
        "category": "geography"
    },
    {
        "questions": "Which country has the largest land area in the world?",
        "multiple_choice": ["A. Canada", "B. China", "C. United States", "D. Russia"],
        "actual_answer": "D",
        "difficulty": "medium",
        "category": "geography"
    },
    {
        "questions": "Which country is completely surrounded by South Africa?",
        "multiple_choice": ["A. Botswana", "B. Lesotho", "C. Eswatini", "D. Namibia"],
        "actual_answer": "B",
        "difficulty": "hard",
        "category": "geography"
    },
    {
        "questions": "Which river is generally considered the longest river in Africa?",
        "multiple_choice": ["A. Congo River", "B. Niger River", "C. Nile River", "D. Zambezi River"],
        "actual_answer": "C",
        "difficulty": "hard",
        "category": "geography"
    },


    # ==================== HISTORY ====================

    {
        "questions": "Who was the first president of the United States?",
        "multiple_choice": ["A. Abraham Lincoln", "B. George Washington", "C. Thomas Jefferson", "D. John Adams"],
        "actual_answer": "B",
        "difficulty": "easy",
        "category": "history"
    },
    {
        "questions": "Which ancient civilization built the pyramids at Giza?",
        "multiple_choice": ["A. Romans", "B. Greeks", "C. Egyptians", "D. Persians"],
        "actual_answer": "C",
        "difficulty": "easy",
        "category": "history"
    },
    {
        "questions": "In which year did World War II end?",
        "multiple_choice": ["A. 1943", "B. 1944", "C. 1945", "D. 1946"],
        "actual_answer": "C",
        "difficulty": "medium",
        "category": "history"
    },
    {
        "questions": "Who was the British Prime Minister for much of World War II?",
        "multiple_choice": ["A. Winston Churchill", "B. Neville Chamberlain", "C. Margaret Thatcher", "D. Tony Blair"],
        "actual_answer": "A",
        "difficulty": "medium",
        "category": "history"
    },
    {
        "questions": "Which empire was ruled by Mansa Musa?",
        "multiple_choice": ["A. Roman Empire", "B. Mali Empire", "C. Ottoman Empire", "D. Songhai Empire"],
        "actual_answer": "B",
        "difficulty": "hard",
        "category": "history"
    },
    {
        "questions": "Which treaty formally ended World War I between Germany and the Allied Powers?",
        "multiple_choice": ["A. Treaty of Paris", "B. Treaty of Versailles", "C. Treaty of Vienna", "D. Treaty of Rome"],
        "actual_answer": "B",
        "difficulty": "hard",
        "category": "history"
    },


    # ==================== TECHNOLOGY ====================

    {
        "questions": "What does CPU stand for?",
        "multiple_choice": ["A. Central Processing Unit", "B. Computer Personal Unit", "C. Central Program Utility", "D. Computer Processing Utility"],
        "actual_answer": "A",
        "difficulty": "easy",
        "category": "technology"
    },
    {
        "questions": "Which device is commonly used to move the pointer on a computer screen?",
        "multiple_choice": ["A. Keyboard", "B. Monitor", "C. Mouse", "D. Printer"],
        "actual_answer": "C",
        "difficulty": "easy",
        "category": "technology"
    },
    {
        "questions": "Which language is primarily used to structure content on a web page?",
        "multiple_choice": ["A. HTML", "B. Python", "C. SQL", "D. C++"],
        "actual_answer": "A",
        "difficulty": "medium",
        "category": "technology"
    },
    {
        "questions": "What does RAM stand for?",
        "multiple_choice": ["A. Read Access Memory", "B. Random Access Memory", "C. Rapid Application Memory", "D. Remote Access Module"],
        "actual_answer": "B",
        "difficulty": "medium",
        "category": "technology"
    },
    {
        "questions": "Which data structure uses the FIFO principle?",
        "multiple_choice": ["A. Stack", "B. Queue", "C. Tree", "D. Graph"],
        "actual_answer": "B",
        "difficulty": "hard",
        "category": "technology"
    },
    {
        "questions": "Which protocol is primarily used to securely transfer web pages over the internet?",
        "multiple_choice": ["A. HTTP", "B. FTP", "C. HTTPS", "D. SMTP"],
        "actual_answer": "C",
        "difficulty": "hard",
        "category": "technology"
    }
        
    ]
    return question_bank

def play_game(name, difficulty):   
    category = set()
    score = 0
    filtered_question = []
    called_question_bank = question_bank()
    # difficulty = level_selections()
    random.shuffle(called_question_bank)
    print("Answer A/B/C/D")
    for data in called_question_bank:
        category.add(data["category"])
    category_list = list(category)
    sorted_list = sorted(category_list, reverse=True)
    for position, category_name in enumerate(sorted_list, start=1):
        print(f"{position} {category_name}")

    while True:
        category_choice = int(input("chose a category: "))
        if category_choice < 1 or category_choice > len(sorted_list):
            print("invalid input")
        else:
            selected_category = sorted_list[category_choice - 1]
            print(selected_category)
            
            break


    
    for data in called_question_bank:
        if data["category"] == selected_category:
            if data["difficulty"] == difficulty:
                filtered_question.append(data)
                random.shuffle(data["multiple_choice"])
                print(f"{data['questions']}")
                for new_data in data['multiple_choice']:
                    print(f"{new_data}")
                while True:
                    new_answer = input(f"Your answer: ").strip().upper()
                    if new_answer not in ["A", "B", "C", "D"]:
                        print("invalid input")
                        continue
                
                    break
                    # answer.append(new_answer)
                if new_answer == data['actual_answer']:
                    score += 5
                    print("correct")
                    print(f"your score is: {score}")
                else:
                    print("wrong answer")
                    for choice in data["multiple_choice"]:
                        if choice[0] == data["actual_answer"]:
                            print(f"The correct answer is: {choice}")
    if not filtered_question:
        print("difficulty is empty")
    else:
        percentage = (score/5)/ len(filtered_question) * 100
        print(f'{name} your percentage is :{percentage}%')
    print(f" {name} your total score is : {score}")
    # print(answer)
    high_score(name, difficulty, score)
    

def save_high_score():
    with open("high_scores.json", "w") as file:
        json.dump(high_scores, file, indent=2)

def load_high_score():
    try:
        with open("high_scores.json", "r") as file:
            saved_file = json.load(file)
            return saved_file
    except FileNotFoundError:
        print("file not found")
        return []
    except json.JSONDecodeError:
        print("faild to read the file")
        return []

high_scores = load_high_score()

main_menu()
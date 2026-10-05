from datetime import datetime
import json
expenses = []
def add_expense():
    expense = {}
    while True:
        expense["category"] = input("What is the name of the category: ").upper().strip()
        if len(expense["category"]) < 3:
            print("category cannot be empty")
            continue           
        expense["discription"] = input("what is the discription:  ")
        if len(expense["discription"]) < 3:
            print("discriptions cannot be empty ")
            continue
        try:        
            expense["price"] = float(input("input price: "))
            if expense["price"] <= 0:
                print("price cannot be less than or equal to 0")
                continue
        except ValueError:
            print("invalid input")
            continue
               
        expense["date"] = input("input date (eg DD/MM/YYYY): ")
        try:
            date_format = "%d/%m/%Y"
            datetime.strptime(expense["date"], date_format)
        except ValueError:
            print("Invalid input try again")
            continue

        if len(expenses) > 0:
            expense["id"] = expenses[-1]["id"] + 1
        else:
            expense["id"] = 1
        expense["is_active"] = True
        expenses.append(expense)
        save_expense(expenses)
        break


        
def view_expense():
    while True:       
            for data in expenses:
                if data["is_active"] == False:
                    continue
                else:
                    print(f"==================================")
                    print(f"{data["category"]}")
                    print("------------------------------------")

                    print(f"{data["discription"]}")
                    print(f"{data["price"]}")
                    print(f"{data["date"]}")
                    print(f"{data["id"]}")
                    # print(f"{data["is_active"]}")

                    print("====================================")
            break

def delete_expense():
    while True:
        # is_active = True
        try:
            
            select_id = int(input( "what id did you want to delete: "))
            filter_id = list(filter(lambda expense: expense["id"] == select_id, expenses))
            if filter_id :
                               
            
                if filter_id[0]["is_active"]== False:
                    print(f"{select_id} already deleted ")
                else:
                    # expenses.remove(filter_id)
                    filter_id[0]["is_active"] =  False
                    # filter_id = is_active
                    print("successfully deleted")
            else:
                print("no available")
                # print(filter_id)
        except ValueError:
            print("invalid input")
        save_expense(expenses)
        break


   
def edit_expense():
    while True:
    

        try:
            to_be_edited = int(input("what id did you want to edit: "))
            filter_id = list(filter(lambda expense: expense["id"] == to_be_edited, expenses))
            if filter_id:
                if filter_id[0]["is_active"] == False:
                    print("already deleted ")
                else:
                    while True:
                        field = input("what field did you want to edit? \n1 Category \n2 Discription \n3 Price \n4 Date \n5 exit: ")
                        if field == "1":
                            category = input("what is the new category you want to put: ").upper().strip()
                            if len(category) < 3:
                                print("category cannot be less than 3 try again")
                            else:
                                filter_id[0]["category"] = category
                                break
                        elif field == "2":
                            discription = input("input your new discription: ")
                            if len(discription) < 3:
                                print("discription cannot be less than 3")
                            else:
                                filter_id[0]["discription"] = discription
                                break
                        elif field == "3":
                            try:
                                price = float(input("input your new price"))
                                if price <= 0:
                                    print("price cannot be 0 or less")
                                    continue
                                else:
                                    filter_id[0]["price"] = price
                                    break
                            except ValueError:
                                print("invalid input")
                        elif field == "4":
                            date = input("input your new date: ")
                            try:
                                date_format = "%d/%m/%Y"
                                datetime.strptime(date, date_format)
                                filter_id[0]["date"] = date
                                break
                            except ValueError:
                                print("Invalid input try again")
                                continue
                        elif field == "5":
                            print("exiting ..........")
                            break
                        else:
                            print("invalid input ")
                            continue

            else:
                print("Id not found")

        except ValueError:
            print("invalid input")
        save_expense(expenses)
        break

def total_expense():
    total_price = 0
    if expenses ==[]:
        print("expenses is empty")
    else:
        for expense in expenses:
            if expense["is_active"] == False:
                continue
            else:

                price = expense["price"]
                total_price += price
                print("=====================================")
                print(expense["category"] + "         " +  str(expense["price"]))
                print("=====================================")
        print("=====================================")                
        print(f'Your total expesnses is: {total_price}')
        print("=====================================")

    


def save_expense(expenses):
     with open("expense.json", "w") as file:
            json.dump(expenses, file, indent=4)


def load_expense():
    try:
        with open("expense.json", "r") as file:
            saved_file = json.load(file)
            return saved_file
    except FileNotFoundError:           
        print("file not found, starting with empty data")
        return expenses
    except json.JSONDecodeError:        
        print("error loading file")
        return expenses


expenses = load_expense()

def main_menu():
    print("-" * len("welcome"))
    print("Welcome")
    print("-" * len("welcome"))
    while True:
        menu = input("press \n1 to add expense \n2 to view expense \n3 to delete expense \n4 to edit expense \n5 to view total expense \n6 to exit: ")
        if menu == "1":
            add_expense()
        elif menu == "2":
            view_expense()
        elif menu == "3":
            delete_expense()
        elif menu == "4":
            edit_expense()
        elif menu == "5":
            total_expense()
        elif menu == "6":
            print("exiting .......")
            break
        else:
            print("invalid input")


main_menu()



    
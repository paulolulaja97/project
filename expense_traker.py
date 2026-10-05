from datetime import datetime
import json

def expence_tracker():
    saved_data = load_expence()
    expence = saved_data["expence"]
    next_id = saved_data["next_id"]
    deleted_ids = saved_data["deleted_ids"]
    while True:
        print("-" * len("welcome"))
        print("welcome")
        print("-" * len("welcome"))

        user_choice = input("press\n 1 to add expence\n 2 to view expence\n 3 to delet expence\n 4 to check total expence\n 5 to edit\n 6 to exit: ")
        if user_choice == "1":
            while True:
                while True:
                    category = input("input the category: ").strip().upper()
                    if category == "":
                        print("Category cannot be empty")
                        
                    else:
                        break 
                        
                if category not in expence:
                    expence[category] = []

                
                id = next_id
                next_id += 1
                
                while True:
                    discription = input("enter the discription: ").strip()
                    if discription == "":
                        print("discription cannot be empty")
                    else:
                        break
                while True:
                    date = input("input the date: DD/MM/YYYY: ")
                    try:
                        date_formart = "%d/%m/%Y"
                        datetime.strptime(date, date_formart)
                        break
                    except ValueError:
                        print("invalid input try again")
                    
                while True:
                    try:
                        price = float(input("input the amoutn here:" ))
                        if price > 0:
                            break
                        else:
                            print("you cannot input a negative price or 0")
                    except ValueError:
                        print("Invalid amount. Please enter a number.")
                info = [id, discription, price, date]               
                expence[category].append(info) 
                expence_json(expence, next_id, deleted_ids)

                while True:
                    next_option = input("do you still want to add expence Y/N: ").upper()
                    if next_option =="N":
                        break
                    elif next_option == "Y":
                        break
                       
                    else:
                        print("invalid input try again")
                if next_option == "Y":
                    continue
                else:
                    break

        elif user_choice == "2":
            while True:

                check = input("what category do you want to check: ").strip().upper()
                if check == "":
                    print("category cannot be empty")                
                elif check in expence:
                    if expence[check] == []:
                         print("category is empty")
                    else:
                        for record in expence[check]:
                            print(f"============={check}=================")
                            print(f" Id: {record[0]}")
                            print(f" Discription: {record[1]}")
                            print(f" Price: {record[2]}")
                            print(f" Date: {record[3]}")
                            print("=============================")                    
                            
                else:
                    print("not available try again")
                while True:
                    next_option = input("do you still want to view expence Y/N: ").upper()
                    if next_option =="N":
                        break
                    elif next_option == "Y":
                        break
                    else:
                        print("invalid input try again")
                if next_option == "Y":
                    continue
                else:
                    break

        elif user_choice == "3":
            while True:
                delete = input("from which category will you like to delete from: ").upper().strip()
                if delete not in  expence:
                    print("category not available try again")
                    continue
                else:
                
                    try:
                        exact_delete = int(input("input the id you want to delete: "))
                        if exact_delete in deleted_ids:
                            print(f"{exact_delete} already deleted")
                            break
                        
                        for record in expence[delete]:
                            if record[0] == exact_delete:
                                expence[delete].remove(record)
                                print(f"you have successfuly deleted  id {record[0]}")
                                deleted_ids.append(exact_delete)
                                break
                        
                        else:
                            
                            print(f"no matching {exact_delete} try again")
                            continue

                    except ValueError:
                        print("invalid input")
                    expence_json(expence, next_id, deleted_ids)
                while True:
                    next_option = input("do you still want to delete expence Y/N: ").upper()
                    if next_option =="N":
                        break
                    elif next_option == "Y":
                        break
                    else:
                        print("invalid input try again")
                if next_option == "Y":
                    continue
                else:
                    break

                        

        elif user_choice == "4":
            total_expence = 0
            for category in expence:
                category_total = 0
                for data in expence[category]:
                    category_price = data[2]
                    category_total += category_price
                    # price = category_price
                    total_expence += category_price
                print("===============================")
                print(f"{category}            {category_total}")
                print("---------------------------------------")
            print(f"your total expence is {total_expence}")
            print("===============================")

        elif user_choice == "5":
            what_to_edit = input("what did you want to edit 1 for categpry\n 2 for expence: ").upper().strip()
            if what_to_edit == "1":
                category_to_edit = input("what category did you want to edit: ").upper().strip()
                if category_to_edit not in expence:
                    print("category miss match")
                else:
                    new_data = input("input what you want to replace it with:").upper().strip()
                    if new_data == "":
                        print("input cannot be empty")
                    elif new_data == category_to_edit:
                        print(f"{new_data} is same with the former category")                 
                        
                    elif new_data not in expence:
                        expence[new_data] = expence[category_to_edit]
                        del expence[category_to_edit]
                        print(f"{new_data} successfuly updated")
                    else:
                        for moving_detail in expence[category_to_edit]:
                            for detail_in_destination in expence[new_data]:
                                if moving_detail[0] == detail_in_destination[0]:
                                    moving_detail[0] = next_id
                                    next_id += 1                           
                            expence[new_data].append(moving_detail)
                            print(f"{new_data} successfully updated")
                        del expence[category_to_edit]
                        
                expence_json(expence, next_id, deleted_ids)

            elif what_to_edit == "2":
                category_to_edit = input("what category did you want to edit: ").upper().strip()
                if category_to_edit in expence:
                    while True:
                        try:
                            what_id = int(input("what id did you want to edit: "))
                            break
                        except ValueError:
                            print("invalid input ")
                    for data in expence[category_to_edit]:
                        if what_id == data[0]:
                            to_be_edited = input("1 to edit discription\n 2 for price\n 3 for date\n 4 to finish: ")
                            if to_be_edited == "1":
                                while True:
                                    new_data = input("input what you want to replace it with: ").strip().upper()
                                    if new_data == "":
                                        print("edit cannot be empty try again")
                                    else:
                                        data[1] = new_data
                                        print(f"{data[1]} is succefully updated")
                                        break
                                    
                            
                            elif to_be_edited == "2":
                                while True:
                                    try:                                            
                                        new_data = float(input("input what you want to replace it with: "))
                                        if new_data <= 0 :
                                            print("it cannot be 0 or less")
                                        else:
                                            data[2] = new_data
                                            print(f"{data[2]} is succefully updated")
                                            break
                                    except ValueError:
                                        print("invalid input try again")
                            elif to_be_edited == "3":
                                while True:
                                    new_data = input("input the date: DD/MM/YYYY: ")
                                    try:
                                        date_formart = "%d/%m/%Y"
                                        datetime.strptime(new_data, date_formart)
                                        
                                        data[3] = new_data
                                        print(f"{data[3]} is succefully updated")
                                        break
                                    
                                    except ValueError:
                                        print("invalid input try again")
                            elif to_be_edited == "4":
                                print("finishing up ..........")
                            else:
                                print("invalid input")
                            expence_json(expence, next_id, deleted_ids)
                            break

                    else:
                        print("no matchin id")
            else:
                print("invalid input")

        elif user_choice == "6":        
            print("exiting ........")
            expence_json(expence, next_id, deleted_ids)
            break
        else:
            print("invalid input try again")


def expence_json(expence, next_id, deleted_ids):
    data = { 
        "expence": expence,
        "next_id": next_id,
        "deleted_ids": deleted_ids }
    with open("expence.json", "w") as file:
        json.dump(data, file, indent=4)

def load_expence():
    try:
        with open("expence.json", "r") as file:
            saved_file = json.load(file)
            return saved_file
    except FileNotFoundError:
        data = default_data()      
        print("file not found, starting with empty data")
        return data
    except json.JSONDecodeError:
        data = default_data()
        print("error loading file")
        return data 

def default_data():
    expence = {}
    next_id = 1
    deleted_ids = []
    data = { 
            "expence": expence,
            "next_id": next_id,
            "deleted_ids": deleted_ids } 
    return data

   
expence_tracker()

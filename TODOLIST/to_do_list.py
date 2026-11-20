# 1. Add a task
# 2. View tasks
# 3. Mark a task as complete
# 4. Delete a task
# 5. Exit
from datetime import datetime, time
import json


def add_task():
    task = {}
    while True:
        task["task"] = input("Add your task here: \n>> ").strip()
        if task["task"] == "":
            print("task cannot be empty")
            continue
        task["is_active"] = True
        task["starting_date"] = datetime.now()
        while True:
            user_input = input("input your ask deu date (dd/mm/yyyy): \n>> ")
            try:
                date_format = "%d/%m/%Y"
                converted_date = datetime.strptime(user_input, date_format)
                task["due_date"] = converted_date
                break
            except ValueError:
                print("invalid date")
                continue
        while True:
            user_inputs = input("input your due time (24 hours format): \n>> ")
            try:
                time_format ="%H:%M"
                converted_time = datetime.strptime(user_inputs, time_format)
                task["duetime"] = converted_time.time()
                break
                
            except ValueError:
                print("invalid time")
                continue
        task["status"] = "pending"
        if len(tasks_list) > 0:
            task["id"] = tasks_list[-1]["id"] + 1

        else:
            task["id"] = 1
        print("Task added succefully")
        tasks_list.append(task)
        break
    saved_tasks()
    return tasks_list

def view_task():
    if tasks_list == []:
        print("no task added yet ")
        return
    else:
        for task in tasks_list:
            task_due = overdue(task)
            if not task["is_active"]:
                continue
            elif task_due:
                print(f"ID: {task['id']}    Task: {task['task']}  created Time and Date: {task['starting_date']}  Due Date: {task['due_date']}   Due time: {task['duetime']}     Status: {task['status']}   Task overdue")

            else:
                print(f"Task Id: {task['id']}    Task: {task['task']}   Created Time and Date: {task['starting_date']}     Due Date: {task['due_date']}   Due Time: {task['duetime']}   Statu: {task['status']}")
    # print(f"{tasks_list}")

def completed_task():
    
    if tasks_list ==[]:
        print("no task added yet")
        return        
    else:
        for task in tasks_list:
            if not task['is_active']:
                continue
            else:
                print(f"{task['id']}   {task['task']}   {task['status']}")
        while True:
            try:
                user_choise = int(input("what id did you complete"))
                for i in tasks_list:
                    
                    if user_choise == i['id']:
                        if not i['is_active'] :
                            print("Task already deleted ")
                            return
                        elif i['status'] == "completed":
                            print("this task is completed") 
                            return
                        else:
                            i['status'] = "completed"
                            print("task completed successfuly")
                            saved_tasks()
                            return
                else:
                    print("Task id not found ")
                    continue
                
            except ValueError:
                print("invalid input")

def delete_a_task():
    if tasks_list == []:
        print("no task yet")
        return
    else:
        for task in tasks_list:
            if not task['is_active']:
                continue
            else:
                print(f"{task['id']}  {task['task']}   {task['status']}")
        while True:
            try:
                user_choise = int(input("what id did you and to delete: \n>>>"))
                for i in tasks_list:
                    if user_choise == i['id']:
                        if not i['is_active']:
                            print("task already deleted")
                            return
                        else:
                            i['is_active'] = False
                            print("deleted successfuly")
                            saved_tasks()
                            return
                    
                else:
                    print("task id not found")
                    continue

            except ValueError:
                print("invalid input")
                continue
            

def edit_task():
    if tasks_list == []:
        print("no task added yet ")
        return
    else:
        for task in tasks_list:
            if not task["is_active"]:
                continue
            else:
                print(f" {task['id']}   {task['task']}   {task['status']}   {task['due_date']}   {task['duetime']}")
        while True:
            try:
                user_choice = int(input("what id did you want to edit \n >>>"))
                if user_choice <= 0:
                    print("fileds cannot be empty")
                    continue
                else :
                    for i in tasks_list:
                        if user_choice == i['id']:
                            if not i['is_active']:
                                print("this task has been deleted and cannot be edited")
                                return
                            else:
                                edit = int(input("enter 1 to edit task \n2 to edit due date \n3 to edit due time \n>>>"))
                                if edit == 1:
                                    while True:
                                        new_task = input("input your new task here: \n>>>").strip()
                                        if new_task == "":
                                            print("filed cannot be empty")
                                            continue
                                        else:
                                            i['task'] = new_task
                                            saved_tasks()
                                            print("eddited successfuly")
                                            return
                                elif edit == 2:
                                    while True:
                                        new_date = input("input your ask deu date (dd/mm/yyyy): \n>> ")
                                        try:
                                            date_format = "%d/%m/%Y"
                                            new_date2 = datetime.strptime(new_date, date_format)
                                            i['due_date'] = new_date2
                                            saved_tasks()
                                            print("eddited successfuly")
                                            return
                                        except ValueError:
                                            print("invalid date")
                                            continue
                                elif edit == 3:
                                    while True:
                                        new_time = input("input your due time (24 hours format): \n>> ")
                                        try:
                                            time_format ="%H:%M"
                                            new_time2 = datetime.strptime(new_time, time_format)
                                            i['duetime'] = new_time2.time()
                                            saved_tasks()
                                            print("eddited successfuly")
                                            return
                                            
                                        except ValueError:
                                            print("invalid time")
                                            continue
                                else:
                                    print("invalid input")
                                    continue
                    else:
                        print("invalid input")
            except ValueError:
                print("invalid input")

def overdue(task):

    current_time = datetime.now()
    deadline = datetime.combine(task['due_date'].date(), task['duetime'])
    if task['status'] == "completed":
        return False
    elif not task['is_active']:
        return False
    elif current_time > deadline:
        return True
    else:
        return False

def view_recycle_bin():
    for task in tasks_list:
        if task['is_active']:
            continue
        else:
            print(f"Task Id: {task['id']}    Task: {task['task']}   Created Time and Date: {task['starting_date']}     Due Date: {task['due_date']}   Due Time: {task['duetime']}   Statu: {task['status']}")

    while True:
        try:
            select = int(input("what id did you want to restore "))
        
            for i in tasks_list:
                if select == i["id"]:
                    if i['is_active']:
                        print("Id not in recycle bin")
                        break
                    else:
                        i['is_active'] = True
                        print("Restoration complete")
                        saved_tasks()
                        return

            else:
                print('Task id not found')
            

        except:
            print("invalid input")




def datetime_convertion(value):
    convertion = value.isoformat()
    return convertion

def datetime_obj_convert(value):
    converted = datetime.fromisoformat(value)
    return converted

def time_obj_convert(value):
    time_converted = time.fromisoformat(value)
    return time_converted




def saved_tasks():
    
    try:
        with open ("tasks_list.json", "w") as file:
            json.dump(tasks_list, file, indent=6, default=datetime_convertion)
        print("saved successfull")
            
    except OSError:
        print("unable to write file ")

    
def load_task():
    try:
        with open("tasks_list.json", "r") as file:
            tasks_list = json.load(file)
            for task in tasks_list:
                task['due_date'] = datetime_obj_convert(task['due_date'])
                task['duetime'] = time_obj_convert(task['duetime'])
                task['starting_date'] = datetime_obj_convert(task['starting_date'])
            return tasks_list
    except json.decoder.JSONDecodeError:
        print('file empt')
        return []
    except FileNotFoundError:
        print("file not found")
        return []
    except ValueError:
        print("unable to load file")
        return []


tasks_list = load_task()


def main_menu():
    while True:
        user_choise = input("press 1 to add task \n2 to view task \n3 to complete a task \n4 to delete a task \n5 to edit task \n6 to view recycle bin \n7 to exit \n>")
        if user_choise == "1":
            add_task()
        elif user_choise == "2":
            view_task()
        elif user_choise == "3":
            completed_task()
        elif user_choise == "4":
            delete_a_task()
        elif user_choise == "5":
            edit_task()
        elif user_choise == "6":
            view_recycle_bin()
        elif user_choise == "7":
            print("Exiting ...............")
            break
        else:
            print("Invalid input")
            continue
    


main_menu()

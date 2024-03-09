// export default function GroupRecipients() {
//   return (
//     <div>
//       <div className="flex flex-col gap-2 py-2" ref={parent}>
//         {form.watch("users")?.map((user, index) => (
//           <div key={index} className="flex gap-2">
//             <div className="flex flex-1 flex-wrap items-start gap-2">
//               <FormInput<typeof formSchema>
//                 control={form.control}
//                 name={`users.${index}.name`}
//                 placeholder="Name"
//               />
//               <FormInput<typeof formSchema>
//                 control={form.control}
//                 name={`users.${index}.email`}
//                 type="email"
//                 required={false}
//                 placeholder="Email"
//               />
//               <FormInput<typeof formSchema>
//                 control={form.control}
//                 name={`users.${index}.phone`}
//                 type="tel"
//                 placeholder="Phone"
//               />
//               <div className="lg:flex-1">
//                 <FormInput<typeof formSchema>
//                   control={form.control}
//                   name={`users.${index}.notes`}
//                   placeholder="Notes"
//                 />
//               </div>
//             </div>
//             <FormItem>
//               <Button
//                 variant="ghost"
//                 type="button"
//                 className="border dark:border-stone-800 dark:hover:bg-stone-200"
//                 onClick={() => handleRemoveUser(index)}
//               >
//                 <MinusCircledIcon className="h-5 w-5" />
//               </Button>
//             </FormItem>
//           </div>
//         ))}
//         <Button
//           type="button"
//           size={"sm"}
//           className="flex w-fit items-center gap-2 pl-2"
//           onClick={handleAddUser}
//         >
//           <PlusCircledIcon className="h-5 w-5" />
//           Add New
//         </Button>
//       </div>
//       <Tabs
//         defaultValue="contacts"
//         className="border-t py-2 dark:border-stone-500 dark:border-opacity-20"
//       >
//         <div className="flex items-center justify-between">
//           <span className="text-lg font-semibold">Recents</span>
//           <TabsList className="grid w-full max-w-[300px] grid-cols-2">
//             <TabsTrigger value="contacts">Contacts</TabsTrigger>
//             <TabsTrigger value="groups">Groups</TabsTrigger>
//           </TabsList>
//         </div>
//         <div className="pt-4">
//           <FormInput<typeof formSchema>
//             control={form.control}
//             name={`recentsSearch`}
//             placeholder="Search for recent contacts or groups"
//           />
//         </div>
//         <div className="flex flex-col pt-2">
//           <TabsContent value="contacts">
//             <div className="flex flex-wrap">
//               {recentUsers.data
//                 ?.filter((user) => !usersAdded.some((u) => u.id === user.id))
//                 .map((user) => (
//                   <Button
//                     key={user.id}
//                     onClick={() => handleClickContact(user)}
//                     type="button"
//                     variant={"ghost"}
//                     className="flex h-fit w-full items-center justify-start gap-2 p-2 lg:w-1/2
//                 dark:hover:bg-stone-800 dark:hover:bg-opacity-20"
//                   >
//                     <Avatar className="h-10 w-10">
//                       <AvatarFallback className="">
//                         {extractInitials(user.name)}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div className="flex flex-col items-start truncate">
//                       <div>{user.name}</div>
//                       <div className="flex text-sm text-stone-500 ">
//                         {user.email && <div>{user.email}</div>}
//                         {user.phone && user.email && (
//                           <div className="mx-1">•</div>
//                         )}
//                         {user.phone && <div>{user.phone}</div>}
//                       </div>
//                     </div>
//                   </Button>
//                 ))}
//             </div>
//           </TabsContent>
//           <TabsContent value="groups">
//             <div className="flex flex-wrap">
//               {recentGroups.data
//                 ?.filter((group) => !groupsAdded.some((g) => g.id === group.id))
//                 .map((group) => (
//                   <Button
//                     key={group.id}
//                     onClick={() => handleClickGroup(group)}
//                     type="button"
//                     variant={"ghost"}
//                     className="flex h-fit w-full items-center justify-start gap-2 p-2 lg:w-1/2 dark:hover:bg-stone-800 dark:hover:bg-opacity-20"
//                   >
//                     <Avatar className="h-10 w-10">
//                       <AvatarFallback className="">
//                         {extractInitials(group.name)}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div className="flex w-full flex-col items-start truncate">
//                       <div>{group.name}</div>
//                       {group.description && (
//                         <div className="text-sm text-stone-500">
//                           {group.description.slice(0, 60)}
//                         </div>
//                       )}
//                     </div>
//                   </Button>
//                 ))}
//             </div>
//           </TabsContent>
//         </div>
//       </Tabs>
//     </div>
//   );
// }

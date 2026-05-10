git : fatal: ambiguous argument 'origin//middleware.ts': unknown revision or pa
th not in the working tree.
At line:1 char:335
+ ... pth=1 2>&1; git show origin/$defaultBranch:src/middleware.ts > middle ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (fatal: ambiguou...e working tree. 
   :String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'

